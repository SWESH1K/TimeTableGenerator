# TimeTableGen

## Authors
- [2310080053 -- Sweshik Reddy](https://www.linkedin.com/in/sweshik/)
- [2310080034 -- Lucky Kumar](https://www.linkedin.com/in/lkx100/)

**Date:** 16 April 2025  

---

## Project Links
- **GitHub Repository:** [https://github.com/SWESH1K/TimeTableGenerator](https://github.com/SWESH1K/TimeTableGenerator)  
- **Website Link:** [https://timetablealgo.onrender.com/](https://timetablealgo.onrender.com/)

---

## Problem Statement
Educational institutions often face challenges in creating efficient and conflict-free timetables. Manual scheduling can lead to:
- Overlapping classes for students or instructors.
- Inefficient utilization of classrooms and resources.
- Difficulty in accommodating specific requirements or constraints.

These issues can result in decreased productivity, student dissatisfaction, and administrative burdens.

---

## Proposed Solution
The Automated Timetable Generator aims to address these challenges by:
- **Automated Scheduling:** Utilizing algorithms to generate timetables that meet predefined constraints and preferences.
- **Conflict Resolution:** Ensuring no overlaps occur for students, instructors, or classrooms.
- **Resource Optimization:** Maximizing the efficient use of available resources.
- **Flexibility:** Allowing easy adjustments to accommodate changes in courses, instructors, or room availability.

---

## Technical Overview
The project is structured into two main components:

1. **Backend:**
    - Developed using Django-REST.
    - Handles data processing, algorithm implementation, and database interactions.

2. **Frontend:**
    - Built using ReactJS.
    - Provides a user-friendly interface for data input and timetable visualization.

The application is containerized using Docker, facilitating easy deployment and scalability.

---

## Mathematical Programming Concepts
The timetable generation problem is modeled as a **Constraint Satisfaction Problem (CSP)** and solved using techniques from **Linear Programming (LP)** and **Integer Linear Programming (ILP)**. The following concepts are applied:

### 1. Decision Variables
Each possible assignment (course, faculty, timeslot, room) is represented as a binary decision variable:

\[
x_{c,t,r} = 
\begin{cases} 
1 & \text{if course } c \text{ is assigned to timeslot } t \text{ and room } r \\ 
0 & \text{otherwise} 
\end{cases}
\]

### 2. Objective Function
The solver may optimize for:
- Minimum conflicts (soft constraint violations).
- Balanced distribution of classes throughout the day/week.
- Efficient classroom usage.

Example:

\[
\text{Minimize } \sum \text{conflict penalties} + \sum \text{unused resources penalties}
\]

### 3. Constraints

#### Constraint 1: Total required classes must be scheduled.
Each course must be scheduled exactly as required, i.e., sum of Lecture (L), Tutorial (T), Practical (P), and Seminar (S):

\[
\sum_{d} \sum_{t} \sum_{\tau \in \{L, T, P, S\}} x_{c,d,t,s,\tau} = L_c + T_c + P_c + S_c \quad \forall s, c \in \text{courses}(s)
\]

#### Constraint 2: Exact number of each type of class.
Each course must have the correct number of each type \( \tau \):

\[
\sum_{d} \sum_{t} x_{c,d,t,s,\tau} = \text{count}_{c,\tau} \quad \forall s, c, \tau \in \{L, T, P, S\}
\]

#### Constraint 3: Professors cannot teach two classes at the same time.
A professor can teach only one class in a time slot:

\[
\sum_{s} \sum_{\substack{c \in \text{courses}(s) \\ \text{prof}(c) = p}} \sum_{\tau} x_{c,d,t,s,\tau} \leq 1 \quad \forall p, d, t
\]

#### Constraint 4: No two courses in the same time slot for a section.
A section cannot attend more than one class at the same time:

\[
\sum_{c \in \text{courses}(s)} \sum_{\tau} x_{c,d,t,s,\tau} \leq 1 \quad \forall s, d, t
\]

#### Constraint 5: Limit continuous hours for a course.
A course must not be scheduled for more than the allowed continuous hours per day:

\[
\sum_{i=t}^{t+k-1} \sum_{\tau} x_{c,d,i,s,\tau} \leq k \quad \forall s, c \in \text{courses}(s), d, t \text{ where } k = \text{max\_continuous\_hours}
\]

---

### 4. Solver Implementation
- The ILP model is solved using the `PuLP` library in Python.
- The backend dynamically parses input data and builds constraints.
- The optimal or feasible solution is formatted and rendered in the frontend.

---

## Conclusion
By automating the timetable generation process, this project seeks to enhance efficiency, reduce errors, and provide a scalable solution adaptable to various institutional needs.
