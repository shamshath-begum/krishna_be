var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const { dbUrl } = require("../config/dbConfig");

// const { CourseModel } = require("../schema/CourseSchema");
const { mediumModel } = require("../schema/mediumSchema ");
const { Student } = require("../schema/studentSchema");
const {
  hashPassword,
  hashCompare,
  createToken,
  decodeToken,
  validate,
  upload,
  roleSalesRep,
  roleAdmin,
  roleStudent,
} = require("../config/auth");
const { AdminModel } = require("../schema/adminSchema");
const { RegisterNumberModel } = require("../schema/registerNumberSchema");
const QuestionModel = require("../schema/questionSchema");
const Syllabus = require("../schema/syllabusSchema");
const Fees = require("../schema/feesSchema");
const ReceiptCounter=require("../schema/receiptCounterSchema")
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');


mongoose.set("strictQuery", true);
mongoose.connect(dbUrl);

router.post("/signup", upload.single("image"), async (req, res) => {
  console.log("first");
  try {
    const { name, email, password, cpassword } = req.body;
    console.log("body", req.body);
    console.log(name);
    if (
      !name ||
      !email ||
      !password ||
      !cpassword ||
      name === "" ||
      email === "" ||
      password === "" ||
      cpassword === ""
    ) {
      res.status(401).send({
        message: "All the fields are required",
      });
    }

    const { filename } = req.file;
    console.log("filename", filename);

    let admin = await AdminModel.findOne({ email: req.body.email });
    if (!admin) {
      req.body.password = await hashPassword(req.body.password);
      req.body.cpassword = await hashPassword(req.body.cpassword);
      let doc = new AdminModel({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        cpassword: req.body.cpassword,
        imgpath: req.file.filename,
      });
      console.log(doc);
      await doc.save();
      res.status(201).send({
        message: "Admin Created successfully",
      });
    } else {
      res.status(400).send({ message: "Admin already registered" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

// login and token creation
router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    let admin = await AdminModel.findOne({ email: req.body.email });
    console.log(admin);
    if (admin) {
      if (await hashCompare(req.body.password, admin.password)) {
        let token = createToken({ id: admin._id });
        console.log(token);

        res
          .status(200)
          .send({ meassage: "Admin Login Successful", token, admin });
      } else {
        res.status(400).send({ message: "Invalid credentials" });
      }
    } else {
      res.status(402).send({ message: "Email doesnot exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

router.post("/courses", async (req, res) => {
  const { medium, mainCourse, subCourses } = req.body;

  try {
    let existingCourse = await mediumModel.findOne({ medium, mainCourse });
    if (existingCourse) {
      // Append new sub-courses without duplicating existing ones
      existingCourse.subCourses = [
        ...new Set([...existingCourse.subCourses, ...subCourses]),
      ];
      await existingCourse.save();
    } else {
      // Create a new course if it doesn't exist
      let newCourse = new Course({ medium, mainCourse, subCourses });
      await newCourse.save();
    }

    res.status(201).send({ message: "Course updated successfully!" });
  } catch (error) {
    res.status(500).send({ error: "There was an error adding the course!" });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const mediums = await mediumModel.find();
    console.log(mediums);
    res.json(mediums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.delete("/courses/:id", async (req, res) => {
  try {
    let deletedCourse = await mediumModel.findByIdAndDelete({
      _id: req.params.id,
    });
    console.log(deletedCourse);
    res.status(200).send({
      message: "course deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      message: "Internal Server error",
      error,
    });
  }
});

router.post("/students-register", upload.single("image"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    if (req.file) {
      console.log("Uploaded file:", req.file.filename);
    } else {
      console.log("No file uploaded");
    }
    let registerNumberDoc = await RegisterNumberModel.findOne();

    if (!registerNumberDoc) {
      registerNumberDoc = new RegisterNumberModel();
    }
    const newRegisterNumber = `kris${registerNumberDoc.lastNumber + 1}`;

    registerNumberDoc.lastNumber += 1;
    await registerNumberDoc.save();

    const studentData = {
      ...req.body,
      image: req.file ? req.file.filename : null, // Ensure image field is set correctly
      registerNumber: newRegisterNumber,
      // instalmentDates: JSON.parse(instalmentDates),
    };

    const student = new Student(studentData);
    console.log("Student data to save:", student);

    await student.save();
    res
      .status(201)
      .json({ message: "Student registered successfully!", student });
  } catch (error) {
    console.error("Error during student registration:", error); // More detailed logging
    res
      .status(400)
      .json({ message: "Error registering student", error: error.message });
  }
});
router.get("/students-details", async (req, res) => {
  try {
    const searchQuery = req.query.q;
    console.log(searchQuery);
    const students = searchQuery
      ? await Student.find({ firstName: new RegExp(searchQuery, "i") })
      : await Student.find({});
    res.json(students);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
      error,
    });
  }
  //   const students = await Student.find(); // Fetch all students from the database
  //   res.status(200).send(
  //     students
  //   );
  // } catch (error) {
  //   res.status(500).json({ message: "Error fetching students", error });
  // }
});

// Example in Node.js/Express
router.get("/student-view/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const student = await Student.findById(req.params.id);
    console.log("student", student);
    if (!student) return res.status(404).send("Student not found");
    res.status(200).json(student);
  } catch (error) {
    res.status(500).send("Server error");
  }
});
router.get("/student-edit/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    console.log("student", student);
    if (!student) return res.status(404).send("Student not found");
    res.status(200).json(student);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

router.put(
  "/student-edit/:id",
  //  upload.single("image"),
  async (req, res) => {
    console.log("hello");
    const { id } = req.params;
    console.log(id);
    console.log("body", req.body);
    try {
      let student = await Student.findById(req.params.id);
      console.log("found Student", student._id);
      if (!student) return res.status(404).send("Student not found");

      const result = await Student.updateOne(
        { _id: id }, // Filter by the student's ID
        { $set: req.body } // Set the new values
      );

      console.log("Update Result:", result);

      // if (req.file) {
      // Delete the old image if it exists
      // if (student.image) {
      //   fs.unlinkSync(`uploads/${student.image}`);
      // }
      // Set the new image filename
      //   req.body.image = req.file.filename;
      // }

      let updatedstudent = await Student.findById(id);
      console.log("updatedstudent", updatedstudent);
      res.status(201).send({
        message: "Student Updated Successfully",
        updatedstudent,
      });
    } catch (error) {
      res.status(500).send({ message: "Student Not Updated" });
    }
  }
);
router.delete("/student-delete/:id", async (req, res) => {
  try {
    let deleteStudent = await Student.findByIdAndDelete({ _id: req.params.id });
    console.log(deleteStudent);
    res.status(200).send({
      message: "student deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      message: "Internal Server error",
      error,
    });
  }
});

// Add or update question paper
router.post("/question-papers-upload", async (req, res) => {
  const { language, subject, chapters } = req.body;

  try {
    // Check if a question paper with the same language and subject exists
    let questionPaper = await QuestionModel.findOne({ language, subject });

    if (questionPaper) {
      // Question paper found, now check for the chapter
      chapters.forEach((newChapter) => {
        const existingChapter = questionPaper.chapters.find(
          (chapter) => chapter.chapterName === newChapter.chapterName
        );

        if (existingChapter) {
          // Chapter exists, append questions to it
          existingChapter.questions.push(...newChapter.questions);
        } else {
          // Chapter does not exist, add new chapter
          questionPaper.chapters.push(newChapter);
        }
      });

      // Save the updated question paper
      await questionPaper.save();
      res
        .status(200)
        .json({ message: "Questions added to existing question paper." });
    } else {
      // Question paper does not exist, create a new one
      const newQuestionPaper = new QuestionModel({
        language,
        subject,
        chapters,
      });
      await newQuestionPaper.save();
      res.status(201).json({ message: "New question paper created." });
    }
  } catch (error) {
    console.error("Error adding question paper", error);
    res.status(400).send({ message: "Error adding question paper", error });
  }
});

router.get("/mediums", async (req, res) => {
  try {
    const mediums = await Syllabus.find({}, "name"); // Fetch only the medium names
    res.json(mediums);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch mediums" });
  }
});

// Get subjects based on the medium
router.get("/subjects/:mediumName", async (req, res) => {
  try {
    const { mediumName } = req.params;
    const syllabus = await Syllabus.findOne({ name: mediumName }, "subjects");
    res.json(syllabus.subjects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Get chapters based on the subject
router.get("/chapters/:mediumName/:subjectName", async (req, res) => {
  try {
    const { mediumName, subjectName } = req.params;
    const syllabus = await Syllabus.findOne({ name: mediumName });
    const subject = syllabus.subjects.find((subj) => subj.name === subjectName); // Find subject by name
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }
    res.json(subject.chapters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chapters" });
  }
});

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Save question paper
router.post("/question-paper", upload.single("image"), async (req, res) => {
  const {
    medium,
    subject,
    chapter,
    questionPaper,
    options,
    answer,
    explanation,
  } = req.body;
  const imageUrl = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : "";
  // const imageUrl = req.file ? req.file.path : '';

  try {
    // Validate and parse options
    let parsedOptions;
    try {
      parsedOptions = JSON.parse(options);
      if (!Array.isArray(parsedOptions)) {
        throw new Error("Options should be an array.");
      }
    } catch (error) {
      return res
        .status(400)
        .json({
          error:
            "Invalid options format. Options should be a valid JSON array.",
        });
    }

    try {
      // Check if a document with the same medium, subject, and chapter exists
      const existingPaper = await QuestionModel.findOne({
        medium,
        subject,
        chapter,
      });

      if (existingPaper) {
        // If it exists, add the new question to the existing document
        existingPaper.questions.push({
          questionPaper,
          options: parsedOptions,
          answer,
          explanation,
          imageUrl,
        });
        await existingPaper.save();
        res
          .status(200)
          .json({ message: "Question added to the existing chapter!" });
      } else {
        // If it does not exist, create a new document
        const newQuestionPaper = new QuestionModel({
          medium,
          subject,
          chapter,
          questions: [
            { questionPaper, options: parsedOptions, answer, explanation },
          ],
        });
        await newQuestionPaper.save();
        res
          .status(201)
          .json({ message: "New question paper created successfully!" });
      }
    } catch (error) {
      console.error("Error saving question paper:", error);
      res.status(500).json({ error: "Failed to upload question paper" });
    }
  } catch (error) {
    console.error("Error saving question paper:", error);
    res.status(500).json({ error: "Failed to upload question paper" });
  }
});

router.use('/receipts', express.static(path.join(__dirname, '../receipts')))

router.put("/add-payment/:studentId", async (req, res) => {
  const { studentId } = req.params;
  const { paymentAmount } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Calculate the new remaining amount
    student.remainingAmount -= paymentAmount;
    student.paidAmounts.push(paymentAmount);

    // Get the current installment date before shifting
    let currentInstalmentDate = student.instalmentDates[0];

    if (!currentInstalmentDate) {
      return res.status(400).json({ message: 'No installment date found' });
    }

    if (typeof currentInstalmentDate === 'string') {
      currentInstalmentDate = new Date(currentInstalmentDate);
    }

    const formattedInstalmentDate = currentInstalmentDate.toLocaleDateString();
    student.instalmentDates.shift();
    await student.save();

    const currentYear = new Date().getFullYear();
    let receiptCounter = await ReceiptCounter.findOne({ year: currentYear });
    if (!receiptCounter) {
      receiptCounter = new ReceiptCounter({ year: currentYear, count: 0 });
    }

    receiptCounter.count += 1;
    await receiptCounter.save();
    const receiptNumber = `${currentYear}KRIS-${receiptCounter.count.toString().padStart(3, '0')}`;

    // Initialize PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, left: 50, right: 50, bottom: 0 }
    });

    const receiptFileName = `receipt-${studentId}-${Date.now()}.pdf`;
    const receiptPath = path.join(__dirname, '../receipts', receiptFileName);

    doc.pipe(fs.createWriteStream(receiptPath));

    // Outer box for content
    doc.rect(40, 40, 760, 500).stroke();

    // Header Section
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#170d63').text('The Krishna Institute of Neet Coaching Centre', { align: 'center' });

    // Add some gap between header and contact details
    doc.moveDown(2);  // Add vertical gap

    // Contact details aligned one by one
    doc.fontSize(12).font('Helvetica').fillColor('black');
    doc.text('Contact:', 50, 100, { align: 'left' });
    doc.text('+91 8680856666', 50, 120, { align: 'left' });
    doc.text('+91 8608546666', 50, 140, { align: 'left' });
    doc.text('+91 431 4050266', 50, 160, { align: 'left' });
    doc.text('www.Krishnainstitute.net', 50, 180, { align: 'left' });

    // Address split into two lines
    doc.text('4th Floor Above ICICI Bank', 400, 100, { align: 'right' });
    doc.text('36/1, 1st Main Road, Ramalinga Nagar', 400, 120, { align: 'right' });
    doc.text('Woraiyur, Trichy-620003', 400, 140, { align: 'right' });

    // Add some gap between the address and FEES RECEIPT
    doc.moveDown(2);  // Add vertical gap

    // Center the FEES RECEIPT title
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#170d63').text('FEES RECEIPT', { underline: true, align: 'center' });

    // Add a larger horizontal line
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(800, doc.y).strokeColor('#170d63').stroke();

    doc.moveDown();

    // Define the left and right column content
    const leftColumnDetails = [
      { label: 'Receipt No.', value: receiptNumber },
      { label: 'Name', value: `${student.firstName} ${student.lastName}` },
      { label: 'Mobile No.', value: student.mobileNumber || 'N/A' },
      { label: "Address", value: student.address },
      { label: 'Main Course', value: student.mainCourse }
    ];

    const rightColumnDetails = [
      { label: 'Student Register No.', value: student.registerNumber },
      { label: 'Total Amount', value: `$${student.totalAmount.toFixed(2)}` },
      { label: 'Amount Paid', value: `$${paymentAmount.toFixed(2)}`, color: '#388e3c' },
      { label: 'Payment Date', value: formattedInstalmentDate }
    ];

    // Apply padding and spacing for each row without boxes
    doc.fontSize(14).fillColor('black');
    let startY = doc.y;

    // Add some gap between columns
    const leftColumnX = 100;
    const rightColumnX = 400;

    // Draw left column with labels in bold and values in normal
    leftColumnDetails.forEach((detail, index) => {
      doc.font('Helvetica-Bold').text(`${detail.label}:`, leftColumnX, startY + (index * 25));
      doc.font('Helvetica').text(detail.value, leftColumnX + 150, startY + (index * 25));
    });

    // Draw right column with labels in bold and values in normal
    rightColumnDetails.forEach((detail, index) => {
      const color = detail.color || 'black';
      doc.font('Helvetica-Bold').fillColor('black').text(`${detail.label}:`, rightColumnX, startY + (index * 25));
      doc.font('Helvetica').fillColor(color).text(detail.value, rightColumnX + 150, startY + (index * 25));
    });

    doc.moveDown(2);

    // Signature Section with proper alignment and gap
    doc.moveDown();
    doc.fontSize(12).fillColor('black').text('Signature:', { underline: true, continued: true });
    doc.moveDown(1);
    doc.text('____________________________', { continued: true });
    doc.moveDown(2);  // Add gap between the signature line and Authorized Signatory
    doc.text('Authorized Signatory', { align: 'right' });

    // End document and respond with the path to the receipt
    doc.end();

    res.status(200).json({ message: 'Payment added successfully', receiptPath: receiptFileName });

  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ message: "Error adding payment" });
  }
});


module.exports = router;