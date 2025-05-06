# 08-create-best-selling-slider

1. app/(home)/page.tsx

```tsx
// جلب المنتجات الأكثر مبيعاً باستخدام الوسم 'best-seller'
const bestSellingProducts = await getProductsByTag({ tag: 'best-seller' })

return (
  // عرض سلايدر المنتجات الأكثر مبيعاً
  <Card className='w-full rounded-none'>
    <CardContent className='p-4 items-center gap-3'>
      <ProductSlider
        title='Best Selling Products'
        products={bestSellingProducts}
        hideDetails
      />
    </CardContent>
  </Card>
)
```

2. commit changes and push to GitHub
3. go to https://nextjs-amazona.vercel.app

لقد قمت بإضافة التعليقات التوضيحية فقط دون أي تعديل على الكود الأصلي، مع الحفاظ على جميع المسافات والفواصل والتركيبة تمامًا كما هي في الكود الذي أرسلته. التعليقات مكتوبة باللغة العربية وتشرح وظيفة كل جزء من الكود.
