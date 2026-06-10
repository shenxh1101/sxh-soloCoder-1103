import { Review } from '@/types'

export const reviews: Review[] = [
  {
    id: 'r1',
    dishId: '1',
    dishName: '秘制红烧肉饭',
    dishImage: 'https://picsum.photos/id/292/300/300',
    rating: 5,
    content: '红烧肉肥而不腻，米饭也很香，分量足！下次还会再点。',
    createdAt: '2026-06-10T12:30:00',
  },
  {
    id: 'r2',
    dishId: '5',
    dishName: '麻辣香锅',
    dishImage: 'https://picsum.photos/id/431/300/300',
    rating: 5,
    content: '麻辣鲜香，料很足，一个人吃单人份刚刚好，很过瘾！',
    createdAt: '2026-06-09T18:45:00',
  },
  {
    id: 'r3',
    dishId: '2',
    dishName: '招牌牛肉面',
    dishImage: 'https://picsum.photos/id/312/300/300',
    rating: 4,
    content: '牛肉很大块，面有嚼劲，汤底稍微咸了一点点，整体不错。',
    createdAt: '2026-06-08T11:20:00',
  },
  {
    id: 'r4',
    dishId: '6',
    dishName: '酸辣粉',
    dishImage: 'https://picsum.photos/id/570/300/300',
    rating: 5,
    content: '太正了！跟在重庆吃的味道一模一样，酸辣够味。',
    createdAt: '2026-06-07T13:10:00',
  },
  {
    id: 'r5',
    dishId: '10',
    dishName: '冰镇酸梅汤',
    dishImage: 'https://picsum.photos/id/1080/300/300',
    rating: 4,
    content: '酸酸甜甜很解暑，喝完一碗还想再来一碗。',
    createdAt: '2026-06-06T14:30:00',
  },
]