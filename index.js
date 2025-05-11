import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";

const app = express();
const port = 4000;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "123456", // Replace with a secure, random string
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day cookie expiration
    },
  })
);

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "hopeconnect",
  password: "Sonu@2005",
  port: 3000, // Default PostgreSQL port
});
db.connect();

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});


app.post("/register", async (req, res) => {
  try {
    const { username, password, name, dob, place, study, account } = req.body;

    // Check if any field is empty
    if (!username || !password || !name || !dob || !place || !study || !account) {
      return res.send("<script>alert('Please fill all fields.'); window.history.back();</script>");
    }

    // Calculate age
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    // Check if user is above 14
    if (age <= 14) {
      return res.send("<script>alert('Only users above 14 are permitted to register.'); window.history.back();</script>");
    }

    // Check if user already exists
    const result = await db.query("SELECT email FROM users WHERE email=$1", [username]);
    if (result.rows.length > 0) {
      return res.send("<script>alert('You have already registered.'); window.history.back();</script>");
    }

    // Insert user into database
    const newUser = await db.query(
      "INSERT INTO users (name, birth_date, email, password, place, account_type, study_field) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id",
      [name, dob, username, password, place, account, study]
    );

    // Store user ID in session
    req.session.user_id = newUser.rows[0].user_id;

    // Show success message and stay on the same page
    return res.send("<script>alert('Registration successful!'); window.location.reload();</script>");

  } catch (error) {
    console.error("Error during registration:", error);
    return res.send("<script>alert('Internal Server Error. Please try again later.'); window.history.back();</script>");
  }
});


app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email=$1", [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      if (storedPassword === password) {
        req.session.user_id = user.user_id;
        const quizResult = await db.query("SELECT * FROM quiz_answers WHERE user_id=$1", [req.session.user_id]);
        if (quizResult.rows.length > 0) {
          return res.redirect("/quiz-options");
        } else {
          return res.render("quiz.ejs");
        }
      } else {
        res.send("Incorrect password");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/quiz-options", async (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect("/login");
  }

  try {
    const result = await db.query(
      `SELECT appointment_date, appointment_time, status 
       FROM appointments WHERE user_id = $1 
       ORDER BY appointment_date DESC, appointment_time DESC 
       LIMIT 1`,
      [userId]
    );

    let appointment = null;
    if (result.rows.length > 0) {
      appointment = {
        date: result.rows[0].appointment_date,
        time: result.rows[0].appointment_time,
        status: result.rows[0].status,
      };
    }

    res.render("quizOptions.ejs", { user: req.session.user, appointment });
  } catch (err) {
    console.error("Error fetching appointment details:", err);
    res.status(500).send("Error retrieving appointment data.");
  }
});

app.get("/quiz", (req, res) => {
  res.render("quiz.ejs");
});

app.post("/retake-quiz", async (req, res) => {
  const userId = req.session.user_id;
  try {
    await db.query("DELETE FROM quiz_answers WHERE user_id=$1", [userId]);
    res.render("quiz.ejs");
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred while resetting the quiz.");
  }
});

app.get("/logintheri", (req, res) => {
  res.render("theril.ejs");
});

app.get("/registertheri", (req, res) => {
  res.render("therir.ejs");
});

app.post("/registertheri", async (req, res) => {
  const { name, username, password, dob, doj, phoneno, study, specializations = [], languages = [] } = req.body;

  try {
    // Calculate age
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--; // Adjust age if the birthday hasn't occurred this year
    }

    // Check if therapist is older than 25
    if (age <= 25) {
      return res.send("<script>alert('Only therapists above 25 years old are allowed to register.'); window.history.back();</script>");
    }

    // Insert therapist data
    const therapistResult = await db.query(
      `INSERT INTO therapists (name, birth_date, email, password, contact_info, qualification, years_of_experience) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING therapist_id`,
      [name, dob, username, password, phoneno, study, doj]
    );

    const therapistId = therapistResult.rows[0].therapist_id;

    // Insert specializations if provided
    if (specializations.length > 0) {
      for (const specId of specializations) {
        await db.query(
          `INSERT INTO therapist_specializations (therapist_id, specialization_id) 
           VALUES ($1, $2)`,
          [therapistId, specId]
        );
      }
    }

    // Fetch language IDs
    const languageIds = [];
    if (languages.length > 0) {
      for (const lang of languages) {
        const languageResult = await db.query(
          `SELECT language_id FROM languages WHERE name = $1`,
          [lang]
        );
        if (languageResult.rows.length > 0) {
          languageIds.push(languageResult.rows[0].language_id);
        }
      }
    }

    // Insert therapist languages
    if (languageIds.length > 0) {
      for (const langId of languageIds) {
        await db.query(
          `INSERT INTO therapist_languages (therapist_id, language_id) 
           VALUES ($1, $2)`,
          [therapistId, langId]
        );
      }
    }

    res.send("Therapist registered successfully!");
  } catch (err) {
    console.error("Error during therapist registration:", err);
    res.status(500).send("Error during therapist registration.");
  }
});


app.post("/logintheri", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM therapists WHERE email=$1", [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      const verified = user.verified;
      if (storedPassword === password && verified) {
        req.session.therapistId = user.therapist_id;
        console.log(req.session);
        return res.redirect("/doctors/dashboard");
      } else {
        res.send("Incorrect password or You are not verified");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/doctors/dashboard", (req, res) => {
  const doctorId = req.session.therapistId;
  res.render("doctor-dashboard.ejs");
})

app.post("/submit-quiz", async (req, res) => {
  const userId = req.session.user_id;
  const answers = {
    question1: req.body.question1,
    question2: req.body.question2,
    question3: req.body.question3,
    question4: req.body.question4,
    question5: req.body.question5,
  };
  let result = "Mild";
  if (answers.question2 === "Over a year" || answers.question3 === "Extremely difficult") {
    result = "Severe";
  } else if (answers.question2 === "1-6 months" || answers.question3 === "Very difficult") {
    result = "Moderate";
  }

  try {
    await db.query(
      "INSERT INTO quiz_answers (user_id, quiz_type, answers, result) VALUES ($1, $2, $3, $4)",
      [userId, "General", answers, result]
    );
    return res.redirect("/recommended-doctors");
  } catch (err) {
    console.error("Error storing quiz answers:", err);
    res.status(500).send("An error occurred while saving your quiz answers.");
  }
});


app.get("/doctor/pending-appointments", async (req, res) => {
  const doctorId = req.session.therapistId; // Assuming doctor is logged in
  if (!doctorId) {
    return res.status(401).send("Doctor not logged in.");
  }

  try {
    // Fetch appointments for the doctor that are pending, including the patient_id
    const appointments = await db.query(
      `SELECT a.*, u.user_id AS patient_id FROM appointments a
       JOIN users u ON a.user_id = u.user_id
       WHERE doctor_id = $1 AND status = 'Pending'`,
      [doctorId]
    );

    if (appointments.rows.length === 0) {
      return res.render("doctor-pending-appointments.ejs", { appointments: [], message: "No pending appointments." });
    }

    res.render("doctor-pending-appointments.ejs", { appointments: appointments.rows });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).send("Error fetching appointments.");
  }
});


app.get("/doctor/set-availability", (req, res) => {
  res.render("doctors_availability.ejs")
})

app.post("/set-daily-availability", async (req, res) => {
  const doctorId = req.session.therapistId;
  console.log(doctorId);
  const { isAvailable, startTime, endTime } = req.body;
  try {
    if (isAvailable === "yes") {
      await db.query(
        `INSERT INTO doctor_daily_availability 
         (doctor_id, availability_date, is_available, start_time, end_time)
         VALUES ($1, CURRENT_DATE, $2, $3, $4)
         ON CONFLICT (doctor_id, availability_date)
         DO UPDATE SET is_available = $2, start_time = $3, end_time = $4`,
        [doctorId, true, startTime, endTime]
      );
    } else {
      await db.query(
        `INSERT INTO doctor_daily_availability 
         (doctor_id, availability_date, is_available)
         VALUES ($1, CURRENT_DATE, $2)
         ON CONFLICT (doctor_id, availability_date)
         DO UPDATE SET is_available = $2, start_time = NULL, end_time = NULL`,
        [doctorId, false]
      );
    }
    res.redirect("/doctors/dashboard");
  } catch (err) {
    console.error("Error setting daily availability:", err);
    res.status(500).send("Error setting daily availability.");
  }
});


app.get("/doctor/patient-info/:patientId", async (req, res) => {
  const { patientId } = req.params;

  try {
    // Fetch patient details from the user_quiz_view using the patientId (user_id)
    const patientInfo = await db.query(
      `SELECT * FROM user_quiz_view WHERE user_id = $1`,
      [patientId]
    );

    if (patientInfo.rows.length === 0) {
      return res.status(404).send("Patient information not found.");
    }

    // Render the patient info page with fetched details
    res.render("patient_info.ejs", { patient: patientInfo.rows[0] });

  } catch (err) {
    console.error("Error fetching patient info:", err);
    res.status(500).send("Error fetching patient information.");
  }
});



app.get("/recommended-doctors", async (req, res) => {
  try {
    const userId = req.session.user_id;
    if (!userId) {
      return res.status(401).send("User not logged in.");
    }

    const quizResult = await db.query(
      "SELECT quiz_type, answers FROM quiz_answers WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).send("No quiz results found for this user.");
    }

    const userQuizType = quizResult.rows[0].answers.question1;
    const userLanguage = quizResult.rows[0].answers.question4;
    console.log(userQuizType)
    const therapists = await db.query(
      `SELECT DISTINCT t.therapist_id, t.name, t.contact_info, s.name AS specialization, l.name AS language
       FROM therapists t
       JOIN therapist_specializations ts ON t.therapist_id = ts.therapist_id
       JOIN specializations s ON ts.specialization_id = s.specialization_id
       JOIN therapist_languages tl ON t.therapist_id = tl.therapist_id
       JOIN languages l ON tl.language_id = l.language_id
       WHERE s.name = $1 AND l.name = $2 AND t.verified=$3`,
      [userQuizType, userLanguage, true]
    );

    if (therapists.rows.length === 0) {
      return res.send("No therapists found matching your criteria.");
    }

    res.render("doctors.ejs", { doctors: therapists.rows, bookAppointmentUrl: "/book-appointment" });
  } catch (err) {
    console.error("Error fetching recommended therapists:", err);
    res.status(500).send("An error occurred while fetching recommended therapists.");
  }
});

app.get("/book-appointment", async (req, res) => {
  const doctorId = req.query.doctorId;
  if (!doctorId) {
    return res.status(400).send("Doctor ID is required.");
  }

  try {
    const doctorResult = await db.query("SELECT name FROM therapists WHERE therapist_id = $1", [doctorId]);
    if (doctorResult.rows.length === 0) {
      return res.status(404).send("Doctor not found.");
    }

    const doctorName = doctorResult.rows[0].name;
    const availabilityResult = await db.query(
      `SELECT start_time, end_time 
       FROM doctor_daily_availability 
       WHERE doctor_id = $1 AND availability_date = CURRENT_DATE AND is_available = true`,
      [doctorId]
    );

    if (availabilityResult.rows.length === 0) {
      return res.render("book_appointment.ejs", { doctorId, doctorName, availableSlots: [] });
    }

    const { start_time, end_time } = availabilityResult.rows[0];
    const slots = [];
    let currentTime = new Date(`1970-01-01T${start_time}`);
    const endTime = new Date(`1970-01-01T${end_time}`);

    while (currentTime < endTime) {
      slots.push(currentTime.toTimeString().slice(0, 5));
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    res.render("book_appointment.ejs", { doctorId, doctorName, availableSlots: slots });
  } catch (err) {
    console.error("Error fetching doctor availability:", err);
    res.status(500).send("Error fetching doctor availability.");
  }
});

app.post("/book-appointment", async (req, res) => {
  const userId = req.session.user_id;
  const { doctorId, appointmentDate, appointmentTime } = req.body;

  try {
    if (!userId) {
      return res.status(401).send("User not logged in.");
    }

    // Check if the user has already booked the same time slot with this doctor
    const existingUserAppointment = await db.query(
      `SELECT * FROM appointments 
       WHERE user_id = $1 AND doctor_id = $2 
       AND appointment_date = $3 AND appointment_time = $4`,
      [userId, doctorId, appointmentDate, appointmentTime]
    );

    if (existingUserAppointment.rows.length > 0) {
      return res.status(400).send("You have already booked an appointment for this time slot.");
    }

    // Check if the time slot is already booked by another user
    const existingAppointment = await db.query(
      `SELECT * FROM appointments 
       WHERE doctor_id = $1 
       AND appointment_date = $2 
       AND appointment_time = $3`,
      [doctorId, appointmentDate, appointmentTime]
    );

    if (existingAppointment.rows.length > 0) {
      return res.status(400).send("This time slot is already booked. Please choose another time.");
    }

    // Insert the new appointment
    await db.query(
      `INSERT INTO appointments (user_id, doctor_id, appointment_date, appointment_time, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, doctorId, appointmentDate, appointmentTime, "Pending"]
    );

    res.send("Appointment successfully booked.");
  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).send("An error occurred while booking your appointment.");
  }
});


app.post("/doctor/appointment-response", async (req, res) => {
  try {
    const { appointmentId, action } = req.body;
    const status = action === "accept" ? "Accepted" : "Rejected";

    // Update appointment status in the database
    await db.query(
      "UPDATE appointments SET status = $1 WHERE appointment_id = $2",
      [status, appointmentId]
    );

    res.redirect("/doctor/pending-appointments"); // Refresh the page after update
  } catch (err) {
    console.error("Error updating appointment status:", err);
    res.status(500).send("Error processing appointment response");
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
