export const MAX_BODY_LENGTH = 1000;

export const splitFields = (fields: any) =>
  fields
    .map((field: any) => {
      const parts: string[][] = [[]];
      let index = 0;
      let currentLength = 0;
      field.value.split('\n').forEach((value: string) => {
        if (value.length + currentLength < MAX_BODY_LENGTH) {
          currentLength += value.length;
          parts[index].push(value);
        } else {
          index += 1;
          currentLength = value.length;
          parts.push([value]);
        }
      });
      return parts.map((value, i) => ({
        name: i === 0 ? field.name : '⬥======',
        value: value.join('\n'),
      }));
    })
    .flat();
