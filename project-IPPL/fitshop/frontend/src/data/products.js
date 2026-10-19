export const products = [
  {
    id: 'linen-shirt',
    name: 'Kemeja Linen Santai',
    category: 'Atasan',
    price: 189000,
    oldPrice: 249000,
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85',
    label: 'BEST SELLER',
    color: 'Sand',
    description:
      'Kemeja linen ringan dengan potongan santai yang nyaman dipakai dari pagi sampai malam.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'everyday-outerwear',
    name: 'Outerwear Everyday',
    category: 'Outerwear',
    price: 329000,
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85',
    label: 'BARU',
    color: 'Olive',
    description:
      'Lapisan ringan dengan warna bumi dan detail minimal untuk menemani aktivitas harian.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'essential-tee',
    name: 'Basic Tee Essential',
    category: 'Atasan',
    price: 129000,
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    color: 'Cloud',
    description:
      'Kaos esensial berbahan lembut dengan siluet rapi dan mudah dipadukan.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'tailored-trousers',
    name: 'Celana Tailored',
    category: 'Bawahan',
    price: 259000,
    rating: '4.7',
    image:
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85',
    label: 'FAVORIT',
    color: 'Stone',
    description:
      'Celana berpotongan lurus yang memberi ruang gerak dan tampilan versatile.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
];

export const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);

export function getProduct(productId) {
  return products.find((product) => product.id === productId);
}
