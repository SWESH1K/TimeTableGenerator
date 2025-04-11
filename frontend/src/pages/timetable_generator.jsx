import axios from "axios"
import { useEffect, useState } from "react";


function TimeTableGenerator() {

    const backend_url = "http://localhost:8000"
    const [timeTable, setTimeTable] = useState('')

    const req_body = {
        "sections": ["A"],
        "courses": {
            "A": ["DMW", "DL", "SDIC", "FSD", "MP", "DAA", "SIL"]
        },
        "professors": {
            "DMW": "Dr Purushotam",
            "DL": "Dr Hitesh",
            "SDIC": "Dr Madhukar",
            "FSD": "Dr Sandeep",
            "MP": "Dr Sudharshan Babu",
            "DAA": "Dr Sukla Satapathy",
            "SIL": "Dr P Vishala"
        },
        "ltps": {
            "DMW": {"L": 4, "T": 1, "P": 2, "S": 0},
            "DL": {"L": 3, "T": 2, "P": 3, "S": 1},
            "SDIC": {"L": 2, "T": 1, "P": 1, "S": 1},
            "FSD": {"L": 5, "T": 2, "P": 3, "S": 1},
            "MP": {"L": 3, "T": 1, "P": 2, "S": 0},
            "DAA": {"L": 4, "T": 1, "P": 1, "S": 0},
            "SIL": {"L": 3, "T": 1, "P": 2, "S": 0}
        },
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "time_slots": ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"],
        "max_continuous_hours": 2
    }

    useEffect(() => {
        axios.post(`${backend_url}/api/generate_timetable/`, req_body)
        .then(function (response) {
            console.log(response.data)
            setTimeTable(JSON.stringify(response.data, undefined, 2))
        })    
    }, [])


    return (
        <>
            <h1>This is the Time-Table</h1>
            <pre>{timeTable}</pre>
        </>
    )
}

export default TimeTableGenerator;