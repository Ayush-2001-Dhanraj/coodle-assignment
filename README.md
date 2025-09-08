<p align="center">
  <b>Ayush Dhanraj</b><br/>
  📧 <a href="mailto:dhanrajaayush123@gmail.com">dhanrajaayush123@gmail.com</a> | 
  💻 <a href="https://github.com/Ayush-2001-Dhanraj">GitHub</a> | 
  🔗 <a href="https://www.linkedin.com/in/ayush-d-1759461a1/">LinkedIn</a>
</p>

# Bu-Bu Ba-Ba: Baby Growth Tracker App - Ayush Dhanraj

A React Native application to track a baby’s growth measurements including weight, height, and head circumference. Built with TypeScript, Zustand for state management, and React Navigation.

---

## Features

- **Multi-Screen Navigation**
  - Bottom tab navigation with **Timeline**, **Add Entry**, and **Profile** screens.
  - Dynamic routing depending on whether a baby profile exists.

- **Baby Profile Management**
  - Create, view, and edit baby profiles.
  - Birth date is validated for growth entry purposes.

- **Growth Measurement Tracking**
  - Add, view, edit, and delete growth measurements.
  - Measurements include **weight**, **height**, and **head circumference**.
  - Unit conversion between **kg/lb** and **cm/in**.
  - Validation for:
    - Date format (`YYYY-MM-DD`)
    - Date not in the future
    - Date not before baby’s birth
    - Positive numeric values for measurements

- **Dynamic Forms**
  - Uses `react-hook-form` with `zod` for type-safe validation.
  - Conditional rendering based on mode:
    - **New Entry**, **View Entry**, **Edit Entry**.
  - Switches for unit selection with automatic conversion.

- **Data Persistence**
  - Async storage for profile and measurements.
  - Automatically loads existing data on app start.
  - Handles missing or future data gracefully.

- **Growth Analysis**
  - Calculates weight percentile using baby’s age in months.
  - Updates measurements dynamically when units are switched.

---

## Tech Stack

- **React Native**  
- **TypeScript**  
- **Zustand** (for state management)  
- **React Navigation** (Bottom Tabs)  
- **React Hook Form + Zod** (form validation)  
- **Day.js** (date handling)  
- **Async Storage** (local persistence)  
- **Custom Utility Functions** for growth calculations

---

## Screenshots

<table>
  <tr>
    <td><img width="180" src="https://github.com/user-attachments/assets/62068338-66ad-4046-b9fe-6497331da597" /></td>
    <td><img width="180" src="https://github.com/user-attachments/assets/5ff71124-b778-4bda-9397-77b6ba47f3d3" /></td>
    <td><img width="180" src="https://github.com/user-attachments/assets/34765e4d-9d4c-4cc0-a50a-be22929a5a12" /></td>
  </tr>
  <tr>
    <td><img width="180" src="https://github.com/user-attachments/assets/ae4bc3a7-5194-470a-a079-6b995773a672" /></td>
    <td><img width="180" src="https://github.com/user-attachments/assets/3645a9a7-b6ab-4d1c-b9ec-30ea05ad903b" /></td>
    <td><img width="180" src="https://github.com/user-attachments/assets/6c8e9aef-b3e1-41c2-9848-bb74bc8c9617" /></td>
  </tr>
  <tr>
    <td><img width="180" src="https://github.com/user-attachments/assets/624f99c7-cb09-4c20-932f-1b1f10c844f1" /></td>
    <td><img width="180" src="https://github.com/user-attachments/assets/b1dd687a-3b63-42e0-818c-947fa78bd4a0" /></td>
    <td><img width="180" src="https://github.com/user-attachments/assets/8a4ff273-55fb-41f3-81d4-f5929896a009" /></td>
  </tr>
  <tr>
    <td><img width="180" src="https://github.com/user-attachments/assets/ab9d58c9-d66b-478b-a073-c8bfbea58567" /></td>
    <td><img width="180" src="https://github.com/user-attachments/assets/1a6328eb-1c4e-4781-bce4-0e4759819914" /></td>
    <td><img width="180" src="https://github.com/user-attachments/assets/8fcb7f63-c5e6-4d00-9956-c1c766cc1d5c" /></td>
  </tr>
</table>

---

## Highlights

- **WHO Growth Percentiles**  
  - Used Python Jupyter Notebook to convert Excel percentile data from WHO's website into JSON format for use in the app.

- **Development Environment**  
  - Built and tested on **Pixel 2 emulator, API 33**.

- **Data Handling**  
  - JSON data is integrated into the app for calculating weight percentiles based on age and gender.

- **Platform & Device Optimization**  
  - Ensures correct rendering and performance on Pixel 2 specifications.
 
---

## Notes

- A baby profile is required before adding growth measurements. Users are prompted to create one if none exists.
- Supports dynamic unit switching for weight, height, and head circumference, with automatic conversion.
- Robust validation for dates:
  - Must be in `YYYY-MM-DD` format.
  - Cannot be in the future.
  - Cannot be before the baby’s birth date.
- Growth entries can be **added**, **viewed**, **edited**, or **deleted**.
- Weight percentiles are calculated based on the baby’s age in months.
- Designed for smooth UX with conditional rendering depending on entry mode (new, view, edit).
- Data is persisted locally using AsyncStorage and loaded automatically on app start.
- Handles edge cases such as missing or future dates gracefully.

- ---

## Folder Structure

<img width="318" height="839" alt="Screenshot 2025-09-08 224110" src="https://github.com/user-attachments/assets/745d7efb-dea1-4ffa-b76e-4f4c9dc29a74" />

## 🚀 Things to Improve

- **Profile Updates Impact**  
  - If the user updates **gender** or **date of birth**, growth percentiles should be recalculated automatically.

- **Graph Enhancements**  
  - Add support for **editing and deleting entries directly from the graph view**.

- **More Growth Indicators**  
  - Currently only **Weight-for-Age** percentiles are implemented.  
  - Future scope: add **Height-for-Age**, **Head Circumference-for-Age**, and **Weight-for-Height** charts.

- **Testing**  
  - Add unit tests for **percentile calculation utility** and other core functions.

- **UI/UX Improvements**  
  - Improve chart legend rendering (separate styles for trendline vs. child points).  
  - Provide smoother animations when switching units or tabs.  

- **Data Export/Backup**  
  - Option to export growth data (CSV/JSON) or sync with cloud storage.

---

## Contact

- **Name:** Ayush Dhanraj  
- **Email:** dhanrajaayush123@gmail.com  
- **GitHub:** [github.com/Ayush-2001-Dhanraj]([https://github.com/ayushdhanraj](https://github.com/Ayush-2001-Dhanraj]))  
- **LinkedIn:** [linkedin.com/in/ayush-d-1759461a1]([https://linkedin.com/in/ayushdhanraj](https://www.linkedin.com/in/ayush-d-1759461a1/]))
