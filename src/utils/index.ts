import { KeyProps } from "../pages/main/main";

export const ConvertNoteObject = (data: any) => {
  const height = 11.7;
  const width = 8.3;
  const unit = 72;

  interface IObject {
    [key: string]: {
      label: string,
      'page num': number,
      quads: number[],
      score: number,
      section: string,
      text: string
    }
  }

  const labels = [];

  const jsonData = JSON.parse(data);

  const myObj: IObject = {};
  const notes: KeyProps[] = [];

  Object.keys(jsonData).map((key1: any) => {
    Object.keys(jsonData[key1]).map((key2: string) => {
      if (!myObj[key2]) {
        myObj[key2] = {
          label: '',
          'page num': -1,
          quads: [],
          score: -1,
          section: '',
          text: ''
        };
      }

      const value = jsonData[key1][key2];
      myObj[key2][key1] = typeof value === 'string' ? value.trim() : value;
    })
  })

  Object.keys(myObj).map((key: string, index: number) => {
    if (myObj[key]['score'] > 0.3) {
      const x0 = myObj[key]['quads'][0];
      const y0 = myObj[key]['quads'][1];
      const x1 = myObj[key]['quads'][2];
      const y1 = myObj[key]['quads'][3];

      const highlightAreas = {
        pageIndex: myObj[key]['page num'] - 1,
        height: 94 * ((y1 - y0) / unit) / height,
        width: 97.5 * ((x1 - x0) / unit) / width,
        left: 97 * (x0 / unit) / width,
        top: 106.6 * (y0 / unit) / height,
      }

      labels.push(myObj[key]['label'])

      notes.push({
        id: index,
        content: '',
        quote: myObj[key]['text'],
        highlightAreas: [highlightAreas],
        label: myObj[key]['label'],
        covered: false,
        section: myObj[key]['section'],
        comments: [],
        aiComments: ['Previous Job: UMD CP Tower #4 \n - Add $4,500 sell (if not covered).\n - The owner had us carry this cost in this job three years ago - NAS 24-04-28.', 'With this being a prime contract, you should double check liquidated damage notices'],
      })
    }
  })

  return { notes, labels: [...new Set(["Additional Cost", "Deliverable", ...labels])] };
}