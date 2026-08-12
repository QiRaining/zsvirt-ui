export function removeSecondVirtualization(input: string) {
  // 查找第一个 "virtualization." 的位置
  const firstIndex = input.indexOf("virtualization.");

  // 如果找到了第一个，从这个位置之后开始查找第二个
  if (firstIndex !== -1) {
    const secondIndex = input.indexOf("virtualization.", firstIndex + 1);

    // 如果找到了第二个，移除它
    if (secondIndex !== -1) {
      return input.slice(0, secondIndex) + input.slice(secondIndex + 15);
    }
  }

  // 如果没有找到第二个 "virtualization."，或者根本没有 "virtualization."，返回原始字符串
  return input;
}
