from rest_framework.response import Response
from rest_framework.decorators import api_view
import rest_framework.status as status
from .TimeTableGenerator import TimetableSolver

# Example POST Request

# {
#     "sections": ["A"],
#     "courses": {
#         "A": ["DMW", "DL", "SDIC", "FSD", "MP", "DAA", "SIL"]
#     },
#     "professors": {
#         "DMW": "Dr Purushotam",
#         "DL": "Dr Hitesh",
#         "SDIC": "Dr Madhukar",
#         "FSD": "Dr Sandeep",
#         "MP": "Dr Sudharshan Babu",
#         "DAA": "Dr Sukla Satapathy",
#         "SIL": "Dr P Vishala"
#     },
#     "ltps": {
#         "DMW": {"L": 4, "T": 1, "P": 2, "S": 0},
#         "DL": {"L": 3, "T": 2, "P": 3, "S": 1},
#         "SDIC": {"L": 2, "T": 1, "P": 1, "S": 1},
#         "FSD": {"L": 5, "T": 2, "P": 3, "S": 1},
#         "MP": {"L": 3, "T": 1, "P": 2, "S": 0},
#         "DAA": {"L": 4, "T": 1, "P": 1, "S": 0},
#         "SIL": {"L": 3, "T": 1, "P": 2, "S": 0}
#     },
#     "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
#     "time_slots": ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"],
#     "max_continuous_hours": 2
# }


@api_view(["POST"])
def generate_timetable(request):
    try:
        # Parse the request data
        data = request.data
        sections = data.get('sections', [])
        courses = data.get('courses', {})
        professors = data.get('professors', {})
        ltps = data.get('ltps', {})
        days = data.get('days', [])
        time_slots = data.get('time_slots', [])
        max_continuous_hours = data.get('max_continuous_hours', 2)

        # Validate required fields
        if not sections or not courses or not professors or not ltps or not days or not time_slots:
            return Response({"error": "Missing required fields in the request."}, status=status.HTTP_400_BAD_REQUEST)

        # Initialize the solver
        solver = TimetableSolver(sections, courses, professors, ltps, days, time_slots, max_continuous_hours)
        solver.define_objective()
        solver.add_constraints()
        solver.solve()
        timetable_df = solver.get_timetable()

        # Restructure the timetable
        structured_timetable = {}
        for day in days:
            structured_timetable[day] = {}
            for time_slot in time_slots:
                slot_data = timetable_df[(timetable_df["Day"] == day) & (timetable_df["Time Slot"] == time_slot)]
                if not slot_data.empty:
                    structured_timetable[day][time_slot] = slot_data.to_dict(orient="records")
                else:
                    structured_timetable[day][time_slot] = []

        return Response({"message": "Timetable generated successfully", "time_table": structured_timetable}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)