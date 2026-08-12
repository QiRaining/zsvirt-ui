importScripts("/vendor/spark.js");
const spark = new SparkMD5.ArrayBuffer();
onmessage = function (e) {
  function blobToBuffer(blob) {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.readAsArrayBuffer(blob);
    });
  }

  const obj = e.data;

  if (obj.type === "one") {
    const { offset, file, sliceSize } = obj;

    const blob = file.slice(offset, offset + sliceSize);

    blobToBuffer(blob).then((buf) => {
      spark.append(buf);
      postMessage({ offset, sliceSize, blob, hash: spark.end() });
    });
  } else {
    const lastSlice = obj.file.size - (obj.file.size % obj.chunk);
    let left = lastSlice;
    const genHashConverse = () => {
      if (left > obj.start) {
        let blob;
        if (left === lastSlice) {
          blob = obj.file.slice(left);
        } else {
          blob = obj.file.slice(left, left + obj.chunk);
        }
        const offset = left;
        blobToBuffer(blob).then((buf) => {
          const spark = new SparkMD5.ArrayBuffer();
          spark.append(buf);
          postMessage([offset, spark.end()]);
          left -= obj.chunk * 1;

          setTimeout(() => {
            genHashConverse();
          }, 0);
        });
      }
    };
    genHashConverse();
  }
};
