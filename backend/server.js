
const express = require("express");
const cors = require("cors");
const processHierarchy = require("./hierarchyProcessor");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/bfhl", (req, res) => {
    const result = processHierarchy(req.body.data || []);

    res.status(200).json({
        user_id: "devangkumar_12112005",
        email_id: "devang1181.be23@chitkarauniversity.edu.in",
        college_roll_number: "2311981181",
        ...result
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "Hierarchy Analyzer API"
    });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT);
