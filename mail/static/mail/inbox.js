document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-detail-view').style.display = 'none';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails=>{
    emails.forEach(datos => {
      const element = document.createElement('div');
      element.className='list-group-item';
      element.innerHTML=`
      <h6>${datos.timestamp}</h6>
      <h4>${datos.sender}</h4>
      <h3>${datos.subject}</h3>
      `;
      element.className=datos.read ? 'list-group-item list-group-item-action':'list-group-item list-group-item-dark';
      element.addEventListener('click', function(){
        ver(datos.id);
        
      })
      document.querySelector('#emails-view').append(element)
    });
  });
}

function enviar(){
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.getElementById('compose-recipients').value,
        subject: document.getElementById('compose-subject').value,
        body: document.getElementById('compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      alert(result);
      load_mailbox('sent');
  });
}
function archivar(id,archived){
  if(!archived)
    fetch(`/emails/${id}`,{
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  });
  if(archived)
    fetch(`/emails/${id}`,{
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  });
  load_mailbox('inbox');
}
function ver(id){
  fetch(`/emails/${id}`)
  .then(response=>response.json())
  .then(email=>{
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-detail-view').style.display = 'block';

    document.querySelector('#emails-detail-view').innerHTML=`
      <p><strong>${email.sender}</strong></p>
      <h6><strong>${email.recipients}</strong></h6>
      <h4><strong>${email.subject}</strong></h4>
      <h6>${email.timestamp}</h6>
      <p>${email.body}</p>
      ${(email.sender_id == email.user_id)?`<button onClick="archivar(${email.id},${email.archived})">${email.archived ? "desarchivar":"archivar"}</button>`:`<br>Enviado`}
    `;

      if(!email.read){
          fetch(`/emails/${email.id}`,{
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }
  })
}