import fetch from 'isomorphic-fetch';
import config from '../config';

const JUDGE_SERVER_URL = config.jalgoarenaApiUrl + "/judge";
const PROBLEMS_SERVER_URL = config.jalgoarenaApiUrl + "/problems";
const DATA_SERVER_URL = config.dataServerUrl;

export const CLOSE_WORK_IN_PROGRESS_WINDOW = 'CLOSE_WORK_IN_PROGRESS_WINDOW';
export function closeWorkInProgressWindow() {
    return {
        type: CLOSE_WORK_IN_PROGRESS_WINDOW
    };
}

export const START_JUDGE = 'START_JUDGE';
export function startJudge() {
    return {
        type: START_JUDGE
    };
}

export function judgeCode(sourceCode, problemId) {
    const options = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
        },
        method: 'post',
        body: sourceCode,
        mode: 'no-cors'
    };
    return dispatch => {
        return fetch(`${JUDGE_SERVER_URL}/problems/${problemId}/submit`, options)
            .then(response => response.json())
            .then(json => dispatch(judgeResultReceived(json, sourceCode, problemId)))
            .catch(error => console.log(error));
    };

}

export const JUDGE_RESULT_RECEIVED = 'JUDGE_RESULT_RECEIVED';
function judgeResultReceived(result, sourceCode, problemId) {
    return {
        type: JUDGE_RESULT_RECEIVED,
        result: Object.assign({sourceCode: sourceCode, problemId: problemId}, result)
    }
}

export const START_FETCHING_PROBLEMS = 'START_FETCHING_PROBLEMS';
export function startFetchingProblems() {
    return {
        type: START_FETCHING_PROBLEMS
    };
}

export const FETCH_PROBLEMS = 'FETCH_PROBLEMS';
export function fetchProblems() {
    const options = {
        headers: {
            'Accept': 'application/json'
        },
        method: 'get',
        mode: 'no-cors'
    };

    return dispatch => {
        return fetch(`${JUDGE_SERVER_URL}/problems`, options)
            .then(response => response.json())
            .then(json => dispatch(setProblems(json)))
            .catch(error => console.log(error));
    };
}

function setProblems(problems) {
    return {
        type: FETCH_PROBLEMS,
        problems
    }
}

export const FETCH_SUBMISSIONS = 'FETCH_SUBMISSIONS';
export function fetchSubmissions(userId) {

    let token = localStorage.getItem('jwtToken');

    if (!token || token === '') {
        return;
    }

    const options = {
        headers: {
            'Accept': 'application/json',
            'Authorization': token
        },
        method: 'get',
        mode: 'no-cors'
    };

    return dispatch => {
        return fetch(`${DATA_SERVER_URL}/submissions/${userId}`, options)
            .then(response => response.json())
            .then(json => dispatch(setSubmissions(json)))
            .catch(error => console.log(error));
    };
}

export function fetchAllSubmissions() {

    let token = localStorage.getItem('jwtToken');

    if (!token || token === '') {
        return;
    }

    const options = {
        headers: {
            'Accept': 'application/json',
            'Authorization': token
        },
        method: 'get',
        mode: 'no-cors'
    };

    return dispatch => {
        return fetch(`${DATA_SERVER_URL}/submissions/`, options)
            .then(response => response.json())
            .then(json => dispatch(setSubmissions(json)))
            .catch(error => console.log(error));
    };
}

function setSubmissions(submissions) {
    return {
        type: FETCH_SUBMISSIONS,
        submissions
    }
}

export const FETCH_PROBLEM_RANKING = 'FETCH_PROBLEM_RANKING';
export function fetchProblemRanking(problemId) {
    const options = {
        headers: {
            'Accept': 'application/json'
        },
        method: 'get',
        mode: 'no-cors'
    };

    return dispatch => {
        return fetch(`${DATA_SERVER_URL}/ranking/${problemId}`, options)
            .then(response => response.json())
            .then(json => dispatch(setProblemRanking(json)))
            .catch(error => console.log(error));
    };
}

function setProblemRanking(problemRanking) {
    return {
        type: FETCH_PROBLEM_RANKING,
        problemRanking
    }
}

export const FETCH_RANKING = 'FETCH_RANKING';
export function fetchRanking() {
    const options = {
        headers: {
            'Accept': 'application/json'
        },
        method: 'get',
        mode: 'no-cors'
    };

    return dispatch => {
        return fetch(`${DATA_SERVER_URL}/ranking/`, options)
            .then(response => response.json())
            .then(json => dispatch(setRanking(json)))
            .catch(error => console.log(error));
    };
}

function setRanking(ranking) {
    return {
        type: FETCH_RANKING,
        ranking
    }
}

export const CHANGE_SOURCE_CODE = 'CHANGE_SOURCE_CODE';
export function changeSourceCode(newValue) {
    return {
        type: CHANGE_SOURCE_CODE,
        sourceCode: newValue
    }
}

export const PROBLEM_REFRESH = 'PROBLEM_REFRESH';
export function problemRefresh() {
    return {
        type: PROBLEM_REFRESH
    }
}

export const SET_CURRENT_PROBLEM = 'SET_CURRENT_PROBLEM';
export function setCurrentProblem(problemId) {
    return {
        type: SET_CURRENT_PROBLEM,
        problemId
    }
}

export const SET_SUBMISSIONS_FILTER = 'SET_SUBMISSIONS_FILTER';
export function setSubmissionsFilter(status) {
    return {
        type: SET_SUBMISSIONS_FILTER,
        status
    }
}

export const SET_CURRENT_PROBLEMS_FILTER = 'SET_CURRENT_PROBLEMS_FILTER';
export function setCurrentProblemsFilter(level) {
    return {
        type: SET_CURRENT_PROBLEMS_FILTER,
        level
    }
}

export function rerunSubmission(sourceCode, userId, problemId, problemLevel, language) {
    const options = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
        },
        method: 'post',
        body: sourceCode,
        mode: 'no-cors'
    };
    return dispatch => {
        return fetch(`${JUDGE_SERVER_URL}/problems/${problemId}/submit`, options)
            .then(response => response.json())
            .then(json => {
                let result = Object.assign({sourceCode: sourceCode, problemId: problemId}, json);

                if (result.status_code === 'ACCEPTED') {
                    result = Object.assign({}, result, {status_code: 'RERUN_ACCEPTED'});
                }

                dispatch(sendSubmission(result, userId, {id: problemId, level: problemLevel}, language, true));
                dispatch(fetchAllSubmissions());
            })
            .catch(error => console.log(error));
    };

}

export const START_SUBMISSION = 'START_SUBMISSION';
export function startSubmission() {
    return {
        type: START_SUBMISSION
    };
}

export const SUBMISSION_SAVED = 'SUBMISSION_SAVED';
export function sendSubmission(result, userId, problem, activeLanguage, isForAll) {

    return dispatch => {

        let token = localStorage.getItem('jwtToken');

        const options = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': token
            },
            method: 'post',
            body: JSON.stringify({
                problemId: problem.id,
                level: problem.level,
                elapsed_time: result.elapsed_time,
                sourceCode: result.sourceCode,
                statusCode: result.status_code,
                userId: userId,
                language: activeLanguage
            }),
            mode: 'no-cors'
        };

        return fetch(`${DATA_SERVER_URL}/submissions`, options)
            .then(response => response.json())
            .then(json => {
                dispatch(submissionSaved(json));
                if (isForAll) {
                    dispatch(fetchAllSubmissions());
                } else {
                    dispatch(fetchSubmissions(userId));
                }
                dispatch(fetchRanking());
            })
            .catch(error => console.log(error));
    };
}

function submissionSaved(submissions) {
    return {
        type: SUBMISSION_SAVED,
        submissions
    }
}

export const DELETE_SUBMISSION = 'DELETE_SUBMISSION';
export function deleteSubmission(submissionId) {
    return dispatch => {

        let token = localStorage.getItem('jwtToken');

        const options = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': token
            },
            method: 'post',
            body: JSON.stringify({}),
            mode: 'no-cors'
        };

        return fetch(`${DATA_SERVER_URL}/submissions/delete/${submissionId}`, options)
            .then(response => response.json())
            .then(json => dispatch(refreshSubmissions(json)))
            .catch(error => console.log(error));
    };
}

function refreshSubmissions(submissions) {
    return {
        type: DELETE_SUBMISSION,
        submissions
    }
}

export const CHANGE_PROGRAMMING_LANGUAGE = 'CHANGE_PROGRAMMING_LANGUAGE';
export function changeActualLanguage(language) {
    return {
        type: CHANGE_PROGRAMMING_LANGUAGE,
        programmingLanguage: language
    }
}

export const HIDE_DONE_PROBLEMS = 'HIDE_DONE_PROBLEMS';
export function hideDoneProblems(value) {
    return {
        type: HIDE_DONE_PROBLEMS,
        hideDoneProblems: value
    }
}

export const CREATE_PROBLEM = 'CREATE_PROBLEM';
export function createProblem(problem) {
    return dispatch => {

        let token = localStorage.getItem('jwtToken');

        const options = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': token
            },
            method: 'post',
            body: JSON.stringify(problem),
            mode: 'no-cors'
        };

        return fetch(`${PROBLEMS_SERVER_URL}/problems/new`, options)
            .then(response => response.json())
            .then(json => {
                console.log('problem saved: ' + json._id);
                dispatch(problemCreated())
            })
            .catch(error => console.log(error));
    };
}

function problemCreated() {
    return {
        type: CREATE_PROBLEM
    }
}