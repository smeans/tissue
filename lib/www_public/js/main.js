$(function () {
  $('.ii.new').on('click', resetIssueForm);
  $('.issue_form').on('submit', saveIssue);
  $('.issue_list').on('click', selectIssue);
  $('.tag_cloud').on('click', selectTag);

  $(archiveButton).on('click', archiveIssue);

  syncIssues();
  resetIssueForm();

  startClient();
});

var tagCloud;

function syncIssues() {
  $.ajax('/~ajax::list', {
    contentType: 'application/json',
    type: 'GET',
    success: function (data) {
      $('.issue_list div[data-id]').remove();
      data.map(t => $('.issue_list').append('<div data-id="' + t.split('-')[0] + '" class="ii"><p>' + t + '</p></div>'));
    }
  });
  $.ajax('/~ajax::tagCloud', {
    contentType: 'application/json',
    type: 'GET',
    success: function (data) {
      tagCloud = data;

      $('.tag_cloud').empty();
      Object.keys(data).forEach(function (k) {
        $('.tag_cloud').append('<div>' + k + '</div>');
      });
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
      syncIssues();

      resetIssueForm();
    }
  });

  return false;
}

function archiveIssue() {
  const si = getSelectedIssue();
  console.log(si);

  if (!si) {
    return;
  }
  
  $.ajax('/~ajax::archiveIssue', {
    data: JSON.stringify({issue_id: si.attr('data-id')}),
    contentType: 'application/json',
    type: 'POST',
    success: function (data) {
      syncIssues();

      resetIssueForm();
    }
  });
}

function resetIssueForm() {
  var form = $('.issue_form')[0];

  form.reset();
  form.issue_id.value = null;

  $('.issue_id').text('(new)');
  $(saveButton).text('create new issue');
  $(archiveButton).hide();
}

function selectIssue(e) {
  var ii = $(e.target).closest('.ii');

  if (ii.length != 1 || $(ii).hasClass('new')) {
    return;
  }

  $('.issue_list .ii').removeClass('selected');
  $(ii).addClass('selected');

  loadIssue($(ii).text().split('-')[0]);
}

function getSelectedIssue() {
  return $('.issue_list .ii.selected');
}

function selectTag(e) {
  if ($(e.target).hasClass('tag_cloud')) {
    return;
  }

  $(e.target).toggleClass('selected');

  filterIssues();
}

function filterIssues() {
  $('.issue_list .ii').removeClass('hidden');

  var iis = [];
  $('.tag_cloud .selected').each(function () {
    iis = iis.concat(tagCloud[$(this).text()]);
  });

  if (iis.length <= 0) {
    return;
  }

  $('.issue_list .ii').each(function () {
    if (iis.indexOf($(this).attr('data-id') ) < 0) {
      $(this).addClass('hidden');
    }
  });
}

function loadIssue(issue_id) {
  $.get('/~ajax::getIssue/' + issue_id, {}, function (data) {
    $.each(data, function (key, value) {
      $('[name=' + key + ']').val(value);
    });
    $('.issue_id').text(data.issue_id);
    $(saveButton).text('save issue');
    $(archiveButton).show();
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
