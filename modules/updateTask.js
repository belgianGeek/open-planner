module.exports = async function updateTask(query, record) {
  query.name = 'update-task';

  if (!record.sendattachment) {
    query = {
      text: `UPDATE ${record.table} SET applicant_name = $1, applicant_firstname = $2, comment = $3, status = $4, user_fk = $5, attachment = $6 WHERE task_id = ${record.id}`,
      values: [record.values[0], record.values[1], record.values[2], record.values[3], record.values[4], record.values[5]]
    }
  } else {
    query = {
      text:`UPDATE ${record.table} SET applicant_name = $1, applicant_firstname = $2, comment = $3, status = $4, user_fk = $5, attachment = $6, attachment_src = $7 WHERE task_id = ${record.id}`,
      values: [record.values[0], record.values[1], record.values[2], record.values[3], record.values[4], record.values[5], record.values[6]]
    }
  }

  return query;
};
