$(function () {
  $('.ii.new').on('click', resetIssueForm);
  $('.issue_form').on('submit', saveIssue);
  $('.issue_list').on('click', selectIssue);

  syncIssues();
  resetIssueForm();

  startClient();
});

function syncIssues() {
  $.ajax('/~ajax::list', {
    contentType: 'application/json',
    type: 'GET',
    success: function (data) {
      data.map(t => $('.issue_list').append('<div data-id="' + t.split(':')[0] + '" class="ii"><p>' + t + '</p></div>'));
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
      if ($('.issue_list div[data-id="' + data.issue_id + '"]').length <= 0) {
        $('.issue_list').append('<div data-id="' + data.issue_id + '" class="ii">');
      }
      $('.issue_list div[data-id="' + data.issue_id + '"]').html('<p>' + data.issue_key + '</p></div>');

      resetIssueForm();
    }
  });

  return false;
}

function resetIssueForm() {
  var form = $('.issue_form')[0];

  form.reset();
  form.issue_id.value = null;
  
  $('.issue_id').text('(new)');
  $('.issue_form button').text('create new issue');
}

function selectIssue(e) {
  var ii = $(e.target).closest('.ii');

  if (ii.length != 1 || $(ii).hasClass('new')) {
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
    $('.issue_form button').text('save issue');
  });
}

function serializeForm(sel) {
  return $(sel).serializeArray().reduce((a, o) => { if (o.value) { a[o.name] = o.value; } return a; }, {});
}

function startClient() {
  $.ajax('/~ajax::startClient', {
    type: 'POST',
    data: '{}',
    contentType: 'application/json',
    success: function (data) {
      window.onbeforeunload = endClient;
    }
  });
}

function endClient() {
  $.ajax('/~ajax::endClient', {
    type: 'POST',
    data: '{}',
    contentType: 'application/json'
  });
}
