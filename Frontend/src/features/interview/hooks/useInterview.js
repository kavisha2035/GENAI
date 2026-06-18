import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"
import { getMockReportForTitle } from "../services/mockReports"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile, seniority = 'mid', mode = 'personalized', jobTitle = '' }) => {
        setLoading(true)
        let responseReport = null

        // 1. Client-Side Cache Key Check
        const cacheKey = `ai_report_cache_${mode}_${seniority}_${jobTitle.replace(/\s+/g, '_')}_${jobDescription ? jobDescription.length : 0}_${selfDescription ? selfDescription.length : 0}_${resumeFile ? resumeFile.name + '_' + resumeFile.size : ''}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setReport(parsed);
                setLoading(false);
                
                // Add to local reports if not there already
                if (mode === 'basic' || parsed._id.startsWith("mock-")) {
                    const localMocks = JSON.parse(localStorage.getItem("local_mock_reports") || "[]");
                    if (!localMocks.some(r => r._id === parsed._id)) {
                        localMocks.unshift(parsed);
                        localStorage.setItem("local_mock_reports", JSON.stringify(localMocks));
                    }
                    getReports();
                }
                return parsed;
            } catch (e) {
                console.error("Failed to parse cached report", e);
            }
        }

        try {
            if (mode === 'basic') {
                // Call the backend API for Basic Mode as well to generate a real report!
                const response = await generateInterviewReport({
                    jobDescription: `Position: ${jobTitle}\nSeniority: ${seniority}`,
                    selfDescription: `Standard preparation plan for ${jobTitle} role at ${seniority} seniority level.`,
                    resumeFile: null
                })
                responseReport = response.interviewReport
            } else {
                // Personalized Mode -> API Call
                const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
                responseReport = response.interviewReport
            }

            if (responseReport) {
                // Add a default questionsToAsk list if backend doesn't return it (fallback for legacy records)
                if (!responseReport.questionsToAsk || responseReport.questionsToAsk.length === 0) {
                    const standardMock = getMockReportForTitle(responseReport.title || jobTitle || "Role");
                    responseReport.questionsToAsk = standardMock.questionsToAsk;
                }

                setReport(responseReport)
                localStorage.setItem(cacheKey, JSON.stringify(responseReport))
                await getReports();
            }
        } catch (error) {
            setLoading(false)
            const serverMessage = error?.response?.data?.message
            throw new Error(serverMessage || error.message || "Failed to generate interview report.")
        } finally {
            setLoading(false)
        }

        return responseReport
    }

    const getReportById = async (id) => {
        setLoading(true)
        let foundReport = null
        try {
            // Check local mocks first
            if (id && id.startsWith("mock-")) {
                const localMocks = JSON.parse(localStorage.getItem("local_mock_reports") || "[]");
                foundReport = localMocks.find(r => r._id === id);
                if (foundReport) {
                    setReport(foundReport);
                    return foundReport;
                }
            }

            const response = await getInterviewReportById(id)
            foundReport = response.interviewReport
            // Add a default questionsToAsk list if backend doesn't return it
            if (foundReport && !foundReport.questionsToAsk) {
                const standardMock = getMockReportForTitle(foundReport.title || "Role");
                foundReport.questionsToAsk = standardMock.questionsToAsk;
            }
            setReport(foundReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return foundReport
    }

    const getReports = async () => {
        let mergedReports = []
        try {
            const response = await getAllInterviewReports()
            const backendReports = response?.interviewReports || []
            
            // Get local mock reports
            const localMocks = JSON.parse(localStorage.getItem("local_mock_reports") || "[]");
            
            // Merge & sort by date (newest first)
            mergedReports = [...localMocks, ...backendReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setReports(mergedReports);
        } catch (error) {
            console.log(error)
            // If offline or failed API, still show local mocks
            const localMocks = JSON.parse(localStorage.getItem("local_mock_reports") || "[]");
            setReports(localMocks);
        }

        return mergedReports
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            // If it's a mock report, alert user that resume download requires personalized mode
            if (interviewReportId.startsWith("mock-")) {
                alert("Resume PDF Generation is only available for reports created with a real uploaded resume (Personalized Mode).");
                return;
            }
            const response = await generateResumePdf({ interviewReportId })
            const blob = response instanceof Blob ? response : new Blob([response], { type: "application/pdf" })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getReports()
        if (interviewId) {
            getReportById(interviewId)
        } else {
            setReport(null)
        }
    }, [interviewId])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}