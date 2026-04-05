window.onload=function()
{
    document.getElementById("username").focus();

};
function alertStatus(checkbox)
{
    if(checkbox.checked)
    {
        alert(checkbox.value+" alerts enabled!");
    }
    else
    {
        alert(checkbox.value+" alerts disabled!");
    }

}
document.getElementById("clearBtn").addEventListener("click",function()
{
    document.getElementById("settingsForm").reset();
    document.getElementById("username").focus();
}
);
document.getElementById("saveBtn").addEventListener("click",function()
{
    const name=document.getElementById("username").value;
    const driverList=document.getElementById("list");
    let selectedDrivers=[];

    for(let i=0;i<driverList.options.length;i++)
    {
        if(driverList.options[i].selected)
        {
            selectedDrivers.push(driverList.options[i].value);
        }
    }
    if(name==="")
    {
        alert("Please enter your name");
    }
    else
    {
        alert(`Profile Saved! \nWelcome, ${name}\nYour Favourite Drivers: ${selectedDrivers.join(", ")}`);
    }

}
);
