export interface IRandomWordParams {
  randomFlag: boolean;
  min: number;
  max: number;
  isWindow: boolean;
}

/**
 * 生成随机密码
 * @param randomFlag 是否随机长度
 * @param min 最小长度
 * @param max 最大长度
 * @param isWindow 是否 Windows 系统（影响特殊字符集）
 */
export function randomWord({
  randomFlag,
  min,
  max,
  isWindow,
}: IRandomWordParams) {
  const length = randomFlag
    ? Math.round(Math.random() * (max - min)) + min
    : Number(min);

  const passwordArray = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "abcdefghijklmnopqrstuvwxyz",
    "1234567890",
    isWindow ? "!@#" : "-.~!@#$%^&*()_:<>?",
  ];

  const password: string[] = [];

  let n = 0;

  for (let i = 0; i < length; i += 1) {
    if (password.length < length - 4) {
      const arrayRandom = Math.floor(Math.random() * 4);
      const passwordItem = passwordArray[arrayRandom];

      const item =
        passwordItem[Math.floor(Math.random() * passwordItem.length)];

      password.push(item);
    } else {
      const newItem = passwordArray[n];
      const lastItem = newItem[Math.floor(Math.random() * newItem.length)];
      const spliceIndex = Math.floor(Math.random() * password.length);

      password.splice(spliceIndex, 0, lastItem);

      n += 1;
    }
  }

  return password.join("");
}
