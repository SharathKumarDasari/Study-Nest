function addSubject(semester) {
  let subjectName = prompt("Enter the subject");

  // Validate input
  if (!subjectName || subjectName.trim() === "") {
      alert("Subject cannot be empty.");
      return;
  }

  // Retrieve subjects for the semester from localStorage
  let subjects = JSON.parse(localStorage.getItem(`semester_${semester}`)) || [];

  // Check for duplicates
  if (subjects.includes(subjectName)) {
      alert("This subject already exists.");
      return;
  }

  // Add the subject to the array and update localStorage
  subjects.push(subjectName);
  localStorage.setItem(`semester_${semester}`, JSON.stringify(subjects));

  // Display the subject on the page
  displaySubject(semester, subjectName);
}

function displaySubject(semester, subjectName) {
  let semesterList = document.querySelector(`.ul${semester}`);
  const listItem = document.createElement('li');
  listItem.className = "sub m-2 ";
  listItem.innerHTML = `
      <a href="">${subjectName}</a>
      <div>
          <button class="btn btn-warning ml-3 upload" data-toggle="modal" data-target="#uploadModal">Upload</button>
          <button onclick="deleteSubject('${semester}', '${subjectName}', this)" class="btn btn-danger deleted">Delete</button>
      </div>
      <div class="modal fade" id="uploadModal" tabindex="-1" role="dialog" aria-labelledby="uploadModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-header d-flex justify-content-between">
                          <h5 class="modal-title" id="uploadModalLabel">Select a PDF to Upload</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                          </button>
                      </div>
                      <form id="uploadForm" enctype="multipart/form-data">
                      <div class="modal-body">
                          <input type="text" id="fileNameInput" name="fileName" placeholder="Enter file name" required>
                          <input type="file" id="fileInput" name="file" multiple required>
                          <div id="message"></div>
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                          <button type="submit" class="btn btn-primary" id="uploadButton">Upload</button>
                      </div>
                      </form>
                  </div>
              </div>
        </div>
  `;

  semesterList.appendChild(listItem);
}

function deleteSubject(semester, subjectName, button) {
  const listItem = button.closest('li');
  if (listItem) {
      listItem.remove();
  }

  let subjects = JSON.parse(localStorage.getItem(`semester_${semester}`)) || [];
  subjects = subjects.filter(subject => subject !== subjectName);
  localStorage.setItem(`semester_${semester}`, JSON.stringify(subjects));
}

function loadSubjects(semester) {
  const subjects = JSON.parse(localStorage.getItem(`semester_${semester}`)) || [];
  subjects.forEach(subject => displaySubject(semester, subject));
}

function initializeSemesters(semesters) {
  semesters.forEach(semester => loadSubjects(semester));
}

// Initialize subjects for semesters 1, 2, ... 8 on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeSemesters([1, 2]);
});
document.addEventListener("DOMContentLoaded", () => {
  initializeSemesters([3, 4]);
});
document.addEventListener("DOMContentLoaded", () => {
  initializeSemesters([5, 6]);
});
document.addEventListener("DOMContentLoaded", () => {
  initializeSemesters([7, 8]);
});

