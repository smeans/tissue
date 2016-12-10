$(function () {
  $('.ii.new').on('click', resetIssueForm);
  $('.issue_form').on('submit', saveIssue);
  $('.issue_list').on('click', selectIssue);

  syncIssues();
  resetIssueForm();
});

function syncIssues() {
  $.ajax('/~ajax::list', {
    contentType: 'application/json',
    type: 'GET',
    success: function (data) {
      data.map(t => $('.issue_list').append('<div class="ii"><p>' + t + '</p></div>'));
    }
  });
}

function saveIssue() {
  var i = serializeForm('.issue_form');

  $.ajax('/~ajax::saveIssue', {
    data: JSON.stringify(i),
    contentType: 'application/json',
    type: 'POST',
    success: function (data) {
      $('.issue_list').append('<div class="ii"><p>' + data.issue_key + '</p></div>');
      resetIssueForm();
    }
  });

  return false;
}

function resetIssueForm() {
  $('.issue_form')[0].reset();
  $('.issue_id').text('(new)');
}

function selectIssue(e) {
  var ii = $(e.target).closest('.ii');

  if (ii.length != 1) {
    return;
  }

  $('.issue_list .ii').removeClass('selected');
  $(ii).addClass('selected');

  loadIssue($(ii).text().split(':')[0]);
}

function loadIssue(issue_id) {
  $.get('/~ajax::getIssue/' + issue_id, {}, function (data) {
    $.each(data, function (key, value) {
      $('[name=' + key + ']').val(value);
    });
    $('.issue_id').text(data.issue_id);
  });
}

function serializeForm(sel) {
  return $(sel).serializeArray().reduce((a, o) => { if (o.value) { a[o.name] = o.value; } return a; }, {});
}
