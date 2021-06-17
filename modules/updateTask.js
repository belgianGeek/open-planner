module.exports = async function updateTask(query) {
  query.name = 'update-task';

  if (!record.sendattachment) {
    query = {
      text: `UPDATE ${record.table} SET applicant_name = $1, applicant_firstname = $2, comment = $3, status = $4, user_fk = $5 WHERE task_id = ${record.id}`,
      values: [record.values[0], record.values[1], record.values[2], record.values[3], record.values[4]]
    }
  } else {
    query = {
      text:`UPDATE ${record.table} SET applicant_name = $0, applicant_firstname = $1, comment = $2, status = $3, user_fk = $4, attachment = $5, attachment_src = $6 WHERE task_id = ${record.id}`,
      values: [record.values[0], record.values[1], record.values[2], record.values[3], record.values[4], record.values[5]]
    }
  }

  return query;
};
