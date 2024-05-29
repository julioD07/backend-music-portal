export interface HashAdapter {
  hashSync(password: string, salt: number): string;
  compareSync(password: string, hash: string): boolean;
}
