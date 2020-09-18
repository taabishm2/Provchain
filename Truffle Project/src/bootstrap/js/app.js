$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip({'placement': 'bottom'});
});

function showSuccessSnackbar() {
    var today = new Date();
    $('.toast').removeClass('error-toast');
    $('.toast').addClass('success-toast');
    $('#toast-time').html("At "+today.getHours() + ":" + today.getMinutes());
    $('#snackbar-title').html("Success");
    $('#snackbar-body').html("The transaction was completed successfully!");
    $('.toast').toast('show');
}

function showErrorSnackbar() {
    var today = new Date();
    $('.toast').removeClass('success-toast');
    $('.toast').addClass('error-toast');
    $('#toast-time').html("At "+today.getHours() + ":" + today.getMinutes());
    $('#snackbar-title').html("Error");
    $('#snackbar-body').html("Error Occurred. Refer to Console for details");
    $('.toast').toast('show');
}

function convertUnixTime(unixTime) {
    var dt=eval(unixTime*1000);
    var myDate = new Date(dt);
    return(myDate.toLocaleString());
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }