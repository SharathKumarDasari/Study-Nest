
function first(){
    window.location.href='first.html';
}
function second(){
  window.location.href='second.html';
}
function third(){
  window.location.href='third.html';
}
function fourth(){
  window.location.href='fourth.html';
}
function home(){
  window.location.href='home.html';
}
function aboutpage(){
  window.location.href='about-us.html';
}

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(this);

    fetch('../../uploads', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('message').innerText = data.message;
        alert('Uploded successfully');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('message').innerText = 'Upload failed.';
    });
});