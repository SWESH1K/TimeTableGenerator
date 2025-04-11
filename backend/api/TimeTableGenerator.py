from pulp import LpMaximize, LpProblem, LpVariable, lpSum, value
import pandas as pd

class TimetableSolver:
    def __init__(self, sections, courses, professors, ltps, days, time_slots, max_continuous_hours):
        self.sections = sections
        self.courses = courses
        self.professors = professors
        self.ltps = ltps
        self.max_continuous_hours = max_continuous_hours
        self.days = days
        self.time_slots = time_slots
        self.model = LpProblem("Timetable_Scheduling", LpMaximize)

        # Decision variables (course, day, time slot, section, type of class)
        self.x = LpVariable.dicts("x", [(c, d, t, s, typ)
                                          for s in sections
                                          for c in courses[s]
                                          for d in days
                                          for t in time_slots
                                          for typ in ['L', 'T', 'P', 'S']], cat='Binary')

    def define_objective(self):
        self.model += lpSum(self.x[c, d, t, s, typ] for s in self.sections for c in self.courses[s] for d in self.days for t in self.time_slots for typ in ['L', 'T', 'P', 'S'])

    def add_constraints(self):
        # Constraint 1: Each course must be scheduled exactly as required (sum of L, T, P, S)
        for s in self.sections:
            for c in self.courses[s]:
                total_classes = sum(self.ltps[c].values())
                self.model += lpSum(self.x[c, d, t, s, typ] for d in self.days for t in self.time_slots for typ in ['L', 'T', 'P', 'S']) == total_classes

        # Constraint 2: Each course must have the correct number of L, T, P, S
        for s in self.sections:
            for c in self.courses[s]:
                for typ in ['L', 'T', 'P', 'S']:
                    self.model += lpSum(self.x[c, d, t, s, typ] for d in self.days for t in self.time_slots) == self.ltps[c][typ]

        # Constraint 3: A professor cannot teach two courses at the same time
        for d in self.days:
            for t in self.time_slots:
                for prof in set(self.professors.values()):
                    self.model += lpSum(self.x[c, d, t, s, typ] for s in self.sections for c in self.courses[s] if self.professors[c] == prof for typ in ['L', 'T', 'P', 'S']) <= 1

        # Constraint 4: No two courses should be at the same time slot for a section
        for s in self.sections:
            for d in self.days:
                for t in self.time_slots:
                    self.model += lpSum(self.x[c, d, t, s, typ] for c in self.courses[s] for typ in ['L', 'T', 'P', 'S']) <= 1

        # Constraint 5: Limit continuous hours for the same subject
        for s in self.sections:
            for c in self.courses[s]:
                for d in self.days:
                    for t in range(len(self.time_slots) - 1):
                        self.model += lpSum(self.x[c, d, self.time_slots[i], s, typ] for i in range(t, min(t + self.max_continuous_hours, len(self.time_slots))) for typ in ['L', 'T', 'P', 'S']) <= self.max_continuous_hours

    def solve(self):
        self.model.solve()

    def print_weekly_timetable(self):
        timetable = {}
        for s in self.sections:
            timetable[s] = {d: {t: '' for t in self.time_slots} for d in self.days}

        for s in self.sections:
            for d in self.days:
                for c in self.courses[s]:
                    for t in self.time_slots:
                        for typ in ['L', 'T', 'P', 'S']:
                            if self.x[c, d, t, s, typ].value() == 1:
                                timetable[s][d][t] = f"{c} ({typ})"

        for s in self.sections:
            print(f"\nWeekly Timetable for Section {s}:")
            section_df = pd.DataFrame.from_dict(timetable[s]).transpose()
            print(section_df)


    def get_timetable(self):
        # Extract the timetable from the solved model
        timetable = []
        for (c, d, t, s, typ), var in self.x.items():
            if value(var) == 1:  # If the variable is part of the solution
                timetable.append({
                    "Course": c,
                    "Day": d,
                    "Time Slot": t,
                    "Section": s,
                    "Type": typ,
                    "Professor": self.professors[c]
                })
        return pd.DataFrame(timetable)  # Return as a DataFrame for better readability