import {createBrowserRouter} from "react-router"
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Landing from "./features/interview/pages/Landing"
import Dashboard from "./features/interview/pages/Dashboard"
import Protected from "./features/auth/components/Protected"
import Interview from "./features/interview/pages/Interview"
import Pricing from "./features/interview/pages/Pricing"
import Resumes from "./features/interview/pages/Resumes"
import CoverLetter from "./features/interview/pages/CoverLetter"
import VoiceInterview from "./features/interview/pages/VoiceInterview"
import Analytics from "./features/interview/pages/Analytics"
import SharedReport from "./features/interview/pages/SharedReport"
import JobTracker from "./features/interview/pages/JobTracker"


export const router=createBrowserRouter([
    {
        path:"/login",
        element:<Login/>
    },{
        path:"/register",
        element:<Register/>
    },{
        path:"/",
        element:<Landing/>
    },{
        path:"/dashboard",
        element:<Protected><Dashboard/></Protected>
    },{
        path:"/interview",
        element:<Protected><Interview/></Protected>
    },{
        path:"/interview/:interviewId",
        element:<Protected><Interview/></Protected>
    },{
        path:"/pricing",
        element:<Pricing/>
    },{
        path:"/resumes",
        element:<Resumes/>
    },{
        path:"/cover-letter",
        element:<Protected><CoverLetter/></Protected>
    },{
        path:"/voice-interview",
        element:<Protected><VoiceInterview/></Protected>
    },{
        path:"/voice-interview/:interviewId",
        element:<Protected><VoiceInterview/></Protected>
    },{
        path:"/analytics",
        element:<Protected><Analytics/></Protected>
    },{
        path:"/shared/:slug",
        element:<SharedReport/>
    },{
        path:"/tracker",
        element:<Protected><JobTracker/></Protected>
    }
])