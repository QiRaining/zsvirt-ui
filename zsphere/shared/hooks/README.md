## @zstack/zsphere-hooks 作为 npm 发布

1. 其他项目(例如 zops)，通过 npm 安装 ， 但是源码还是放在 zstack cloud 管理，在每次 代码合并到 cloud master 代码之后，cloud 需要 发布一次 @zstack/zsphere-hooks ,types 的 packagejson 依赖会在发布的时候修改 deps 所以需要脚本处理，不会和 cloud 使用冲突使用
2. 执行发布 pnpm pub:hooks
3. 发布会在 npm 上获取最新版本，然后迭代一个新版本号
