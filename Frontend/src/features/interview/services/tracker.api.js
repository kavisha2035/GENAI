import { api } from "../../auth/services/auth.api";

const BASE = '/api/tracker';

export const fetchJobs = () => api.get(BASE);
export const createJob = (data) => api.post(BASE, data);
export const updateJob = (id, data) => api.patch(`${BASE}/${id}`, data);
export const deleteJob = (id) => api.delete(`${BASE}/${id}`);
export const fetchDeadlines = () => api.get(`${BASE}/deadlines`);

export const fetchCodingQuestions = (reportId) => api.get(`/api/interview/${reportId}/coding`);
