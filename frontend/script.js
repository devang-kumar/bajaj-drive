document.getElementById('submitBtn').addEventListener('click',async()=>{
const error=document.getElementById('error');
const result=document.getElementById('result');
error.textContent='';
result.textContent='';

const data=document.getElementById('nodes').value
.split(',')
.map(v=>v.trim())
.filter(v=>v.length);

try{
const response=await fetch('https://bajaj-drive.onrender.com/bfhl',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({data})
});

if(!response.ok) throw new Error('API request failed');

const json=await response.json();
result.textContent=JSON.stringify(json,null,2);
}catch(e){
error.textContent=e.message;
}
});
