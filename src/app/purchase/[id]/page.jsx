'use client';
'use client';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import NoHeader from '@/components/layout/NoHeader';
import CardProfile from '@/components/ui/card/cardProfile/CardProfile';
import ExchangeInfoSection from '@/components/exchange/ExchangeInfoSection';
import Image from 'next/image';
import {fetchPurchase} from '@/lib/api/purchase';

function PurchasePage() {
  const {id} = useParams();
  const [photoCard, setPhotoCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCard = async () => {
      if (!id) return;
      try {
        const data = await fetchPurchase(id);
        setPhotoCard(data);
      } catch (error) {
        console.error('카드 정보를 불러오는 데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCard();
  }, [id]);

  if (isLoading) {
    return <div className="text-white text-center mt-10">로딩 중...</div>;
  }

  const {name, imageUrl, description, grade, genre} = photoCard;

  return (
    <div className="mx-auto w-[345px] tablet:w-[704px] pc:w-[1480px]">
      <NoHeader title="마켓플레이스" />

      <section className="mt-5 mb-[26px] tablet:mb-12 pc:mb-[70px]">
        <h3 className="mb-[10px] tablet:mb-5 font-bold text-2xl text-white">
          {photoCard.name}
        </h3>
        <hr className="border-2 border-gray100" />
      </section>

      <section className="flex flex-col tablet:flex-row gap-5 pc:gap-20 mb-30">
        {/* 카드 이미지 */}
        <div className="w-[345px] tablet:w-[342px] pc:w-240 h-[258.75px] tablet:h-[256.5px] pc:h-180 relative">
          <Image
            src={photoCard.imageUrl}
            alt={photoCard.name}
            fill
            className="object-cover"
          />
        </div>

        {/* 카드 상세 컴포넌트 */}
        <div className="w-full tablet:flex-1">
          <CardProfile type="buyer" cards={[photoCard]} />
        </div>
      </section>

      {/* 교환 희망 정보 */}
      <ExchangeInfoSection
        info={{
          description:
            '푸릇푸릇한 여름 풍경, 눈 많이 내린 겨울 풍경 사진에 관심이 많습니다.',
          grade: grade || 'COMMON',
          genre: genre || '장르 없음',
          onClick: () => {
            // 교환 제안 모달 열기 등
            console.log('교환 제안하기 클릭');
          },
        }}
      />
    </div>
  );
}
