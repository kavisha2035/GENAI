require("dotenv").config({ path: require("path").join(__dirname, ".env") })
const app = require("./src/app")

const connectToDB = require("./src/config/database")
const { resume, selfDescription, jobDescription } = require("./src/services/temp")
const generateInterviewReport = require("./src/services/ai.service")

connectToDB();

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is listening to port ${PORT}.`)
})