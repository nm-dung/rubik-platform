export type Category = 'F2L' | 'OLL' | 'PLL';

export interface Algorithm {
  id: string;
  name: string;
  category: Category;
  notation: string;
  imageUrl: string;
}

export const algorithmsData: Algorithm[] = [
  {
    id: 't-perm',
    name: 'T Perm',
    category: 'PLL',
    notation: "R U R' U' R' F R2 U' R' U' R U R' F'",
    // Using a placeholder image generator for now
    imageUrl: 'https://placehold.co/200x200/f8fafc/121212?text=T+Perm+Img',
  },
  {
    id: 'jb-perm',
    name: 'Jb Perm',
    category: 'PLL',
    notation: "R U R' F' R U R' U' R' F R2 U' R' U'",
    imageUrl: 'https://placehold.co/200x200/f8fafc/121212?text=Jb+Perm+Img',
  },
  {
    id: 'sune',
    name: 'Sune',
    category: 'OLL',
    notation: "R U R' U R U2 R'",
    imageUrl: 'https://placehold.co/200x200/f8fafc/121212?text=Sune+Img',
  },
  {
    id: 'f2l-1',
    name: 'Basic Insert (Right)',
    category: 'F2L',
    notation: "U R U' R'",
    imageUrl: 'https://placehold.co/200x200/f8fafc/121212?text=F2L+Img',
  }
];