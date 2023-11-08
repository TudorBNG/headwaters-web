export const ConvertNoteObject = (data: any) => {
  const jsonData = JSON.parse(data);
  const myObj = {};

  Object.keys(jsonData).map((key1) => {
    Object.keys(jsonData[key1]).map((key2) => {
      if (!myObj[key2]) myObj[key2] = {};

      const value = jsonData[key1][key2];
      myObj[key2][key1] = typeof value === 'string' ? value.trim() : value;
    })
  })

  return myObj;
}