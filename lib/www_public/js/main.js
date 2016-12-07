$(function () {
  $('.ii.new').on('click', resetIssueForm);

  resetIssueForm();
});

function resetIssueForm() {
  $('.issue_form')[0].reset();
}
