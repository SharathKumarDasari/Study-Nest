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
  addSub(subjectName);
}

function displaySubject(semester, subjectName) {
  let semesterList = document.querySelector(`.ul${semester}`);
  const listItem = document.createElement('li');
  listItem.className = "sub m-2 ";
  listItem.innerHTML = `
      <a href="">${subjectName}</a>
      <div>
          <button class="btn btn-secondary ml-3" onclick="openSubject('${subjectName}', this)">Open</button>
          <button class="btn btn-warning ml-3 upload" data-toggle="modal" data-target="#uploadModal_${subjectName}">Upload</button>
          <button onclick="deleteSubject('${semester}', '${subjectName}', this)" class="btn btn-danger deleted">Delete</button>
      </div>
      <div class="modal fade" id="uploadModal_${subjectName}" tabindex="-1" role="dialog" aria-labelledby="uploadModalLabel_${subjectName}" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
              <div class="modal-content shadow-lg">
                  <div class="modal-header bg-primary text-white">
                      <h5 class="modal-title" id="uploadModalLabel_${subjectName}">Upload PDF for ${subjectName}</h5>
                      <button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>               
                  </div>
                  <form id="uploadForm_${subjectName}" enctype="multipart/form-data">
                      <div class="modal-body">
                          <div class="form-group">
                              <label for="fileInput_${subjectName}">Select File</label>
                              <input type="file" class="form-control-file" id="fileInput_${subjectName}" name="file" required>
                          </div>
                          <div id="message_${subjectName}" class="text-danger"></div>
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                          <button type="submit" class="btn btn-primary" id="uploadButton_${subjectName}">Upload</button>
                      </div>
                  </form>
              </div>
          </div>
      </div>
  `;

  semesterList.appendChild(listItem);

  // Handle upload for the subject
  const form = document.getElementById(`uploadForm_${subjectName}`);
  form.addEventListener('submit', function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      formData.append('subject', subjectName);  // Add the subject name

      fetch(`/upload/${subjectName}`, {
          method: 'POST',
          body: formData
      })
      .then(response => response.text())
      .then(data => {
          alert('File uploaded successfully.');
      })
      .catch(error => {
          console.error('Error uploading file:', error);
          alert('Error uploading file.');
      });
  });
}

function deleteSubject(semester, subjectName, button) {
  const listItem = button.closest('li');
  if (listItem) {
      listItem.remove();
  }

  let subjects = JSON.parse(localStorage.getItem(`semester_${semester}`)) || [];
  subjects = subjects.filter(subject => subject !== subjectName);
  localStorage.setItem(`semester_${semester}`, JSON.stringify(subjects));
  deleteSub(subjectName);
}

function openSubject(subjectName, button) {
  window.location.href = `/${subjectName}.html`;  // Open the subject's page directly
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

function addSub(subjectName) {
  fetch(`/create-page/${subjectName}`, {
      method: 'POST'
  }).then(response => response.text())
    .catch(err => console.error('Error:', err));
}

function deleteSub(subjectName) {
  fetch(`/delete-page/${subjectName}`, {
      method: 'DELETE'
  }).then(response => response.text())
    .catch(err => console.error('Error:', err));
}
