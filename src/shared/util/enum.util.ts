// https://stackoverflow.com/a/18150809/10207850
export const makeEnum = (enumObject): any[] => {
  const all = []
  for (const key in enumObject) {
    all.push(enumObject[key])
  }
  return all
}
