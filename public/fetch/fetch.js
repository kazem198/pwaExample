// var xhr = new XMLHttpRequest();
// xhr.open('GET','https://reqres.in/api/users/2');
// xhr.responseType='json';

// xhr.onload = function (){
//     console.log(xhr.response);

// }

// xhr.onerror = function (){
//     console.log('Error !');

// }

// xhr.send();

// $.get('https://reqres.in/api/users/2',function(res){
//     console.log(res);
// });

fetch('https://reqres.in/api/users/3')
    .then(function (response) {
        console.log(response);
        return response.json();
    }).then(function (res) {
        console.log(res);
        console.log(res.data);



        var firstname = document.getElementById('firstname');
        var lastname = document.getElementById('lastname');
        var avatar = document.getElementById('avatar');

        firstname.innerHTML = res.data.first_name;
        lastname.innerHTML = res.data.last_name;
        avatar.src = res.data.avatar;


    }).catch(function (err) {
        console.log(err);
    });

fetch('./about.html')
    .then(function (res) {
        return res.text();
    }).then(function (response) {
        var el = document.getElementById('about');
        el.innerHTML = response;
    }).catch(function (err) {
        console.log(err);
    });

fetch('https://reqres.in/api/users', {
    method: 'post', // put delete get
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        name: 'Iman',
        job: 'Developer & Teacher'
    }),
    mode: 'cors',
    cache: 'default'
})
    .then(function (response) {
        return response.json();
    }).then(function (res) {
        console.log(res);
        var el = document.getElementById('about');
        el.innerHTML = res.name;
    })
    .catch(function (err) {
        console.log('error', err);

    });