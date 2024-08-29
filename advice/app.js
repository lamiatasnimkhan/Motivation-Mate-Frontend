document.getElementById('getAdviceBtn').addEventListener('click',function(){
    fetch('https://api.adviceslip.com/advice')
    .then(response => response.json())
    .then(data => {
        const advice=data.slip.advice;
        const adviceContainer=document.getElementById('adviceContainer');
        adviceContainer.innerHTML=`<p>${advice}</p>`;
        adviceContainer.style.display= 'block';
})
.catch(error=>{
    console.log(error);
    alert('failed,try again');
});
});
