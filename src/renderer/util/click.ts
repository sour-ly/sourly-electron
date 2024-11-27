// use this when you want to absorb a click event
export function absorb(e: React.MouseEvent<any, MouseEvent>) {
  e.preventDefault();
  e.stopPropagation();
}
