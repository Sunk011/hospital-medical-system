const bcrypt = require('bcrypt');

const users = ['admin', 'doctor1', 'doctor2', 'doctor3', 'nurse1', 'nurse2', 'reception1', 'reception2'];

async function generateHashes() {
  console.log('-- 生成的密码哈希值（密码与用户名一致）:');
  for (const user of users) {
    const hash = await bcrypt.hash(user, 10);
    console.log(`-- ${user}: '${hash}'`);
  }
}

generateHashes();
