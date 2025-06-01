'use client';

import {useState, useEffect} from 'react';
import {useParams} from 'next/navigation';
import {useQuery} from '@tanstack/react-query';
import ExchangeInfoSection from '@/components/exchange/ExchangeInfoSection';
import CardDetailSection from '@/components/common/TransactionSection';
import ExchangeInfoSkeleton from '@/components/ui/skeleton/ExchangeInfoSkeleton';
import TransactionSkeleton from '@/components/ui/skeleton/TransactionSkeleton';
import {fetchPurchase} from '@/lib/api/purchase';
import {fetchMyCards} from '@/lib/api/shop';
import {useAccessToken} from '@/hooks/useAccessToken';
import MyExchangeList from '@/components/exchange/MyExchangeList';
import {fetchMyExchangeRequests} from '@/lib/api/exchange';

function getErrorMessage(purchaseError, cardError, purchaseData) {
  return (
    purchaseError?.message ||
    cardError?.message ||
    (purchaseData?.remainingQuantity === 0
      ? '잔여 수량이 0인 상품입니다. 구매할 수 없습니다.'
      : null)
  );
}

function PurchaseSkeleton() {
  return (
    <div className="mx-auto w-[345px] tablet:w-[704px] pc:w-[1480px]">
      <TransactionSkeleton type="buyer" />
      <ExchangeInfoSkeleton />
    </div>
  );
}

export default function PurchasePage() {
  const {id} = useParams();
  const accessToken = useAccessToken();
  const [myProposals, setMyProposals] = useState([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);

  const {
    data: purchaseData,
    isLoading: isLoadingPurchase,
    isError: isErrorPurchase,
    error: purchaseError,
  } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => fetchPurchase(id, accessToken),
    enabled: !!id && !!accessToken,
  });

  const {
    data: myCardData,
    isLoading: isLoadingCards,
    isError: isErrorCards,
    error: cardError,
  } = useQuery({
    queryKey: ['myCards', id],
    queryFn: () =>
      fetchMyCards({filterType: 'status', filterValue: 'IDLE,LISTED'}),
    enabled: !!accessToken,
  });

  const {data: myExchangeData, isLoading: isLoadingExchanges} = useQuery({
    queryKey: ['myExchangeRequests', id],
    queryFn: () => fetchMyExchangeRequests(id, accessToken),
    enabled: !!id && !!accessToken,
  });

  useEffect(() => {
    const loadExchangeProposals = async () => {
      if (!myExchangeData?.data) {
        setMyProposals([]);
        return;
      }

      setIsLoadingProposals(true);

      try {
        console.log('교환 요청 원본 데이터:', myExchangeData.data);

        const exchangeProposals = myExchangeData.data.map(exchange => {
          // requestCard 객체에서 필요한 정보 추출
          const requestCard = exchange.requestCard || {};
          const photoCard = requestCard.photoCard || {};
          const user = requestCard.user || {};

          return {
            id: exchange.id,
            exchangeId: exchange.id,
            requestCardId: exchange.requestCardId,
            targetCardId: exchange.targetCardId,
            imageUrl: photoCard.imageUrl || '/logo.svg',
            name: photoCard.name || '카드 이름',
            grade: photoCard.grade || 'COMMON',
            genre: photoCard.genre || '장르 없음',
            description: exchange.description || photoCard.description || '설명 없음',
            status: exchange.status || 'REQUESTED',
            createdAt: exchange.createdAt || new Date().toISOString(),
            nickname: user.nickname || '프로여행러',
            price: photoCard.price || 0,
          };
        });

        console.log('변환된 교환 제안 데이터:', exchangeProposals);

        // 최신순으로 정렬하고 취소되지 않은 교환만 표시
        const sortedProposals = exchangeProposals
          .filter(proposal => proposal.status === 'REQUESTED')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log('필터링 및 정렬된 교환 제안:', sortedProposals);
        setMyProposals(sortedProposals);
      } catch (error) {
        console.error('교환 요청 데이터 변환 중 오류:', error);
        setMyProposals([]);
      } finally {
        setIsLoadingProposals(false);
      }
    };

    loadExchangeProposals();
  }, [myExchangeData]);

  const handleCancelExchange = exchangeId => {
    console.log('교환 취소:', exchangeId);
    setMyProposals(prev => prev.filter(card => card.exchangeId !== exchangeId));
  };

  const isLoading =
    isLoadingPurchase ||
    isLoadingCards ||
    isLoadingExchanges ||
    isLoadingProposals;
  const isError = isErrorPurchase || isErrorCards;
  const errorMessage = getErrorMessage(purchaseError, cardError, purchaseData);

  if (isLoading) return <PurchaseSkeleton />;

  if (isError || !purchaseData) {
    return (
      <div className="text-white text-center mt-10">
        {errorMessage || '포토카드를 찾을 수 없습니다.'}
      </div>
    );
  }

  console.log('구매 데이터 전체 구조:', JSON.stringify(purchaseData, null, 2));
  console.log('교환 관련 정보:', {
    exchangeGrade: purchaseData.exchangeGrade,
    exchangeGenre: purchaseData.exchangeGenre,
    exchangeDescription: purchaseData.exchangeDescription,
    listingType: purchaseData.listingType
  });

  return (
    <div>
      <CardDetailSection
        type="buyer"
        photoCard={purchaseData}
        error={errorMessage}
      />

      <ExchangeInfoSection
        info={{
          cardId: purchaseData.photoCard?.id,
          shopListingId: purchaseData.id,
          myCards: myCardData?.result || [],
          targetCardId: id,
          exchangeGrade: purchaseData.exchangeGrade,
          exchangeGenre: purchaseData.exchangeGenre,
          exchangeDescription: purchaseData.exchangeDescription,
          listingType: purchaseData.listingType
        }}
        onSelect={(requestCardId, description) => {
          const proposedCard = myCardData?.result.find(
            card => card.id === requestCardId,
          );
          if (proposedCard) {
            setMyProposals(prev => [...prev, proposedCard]);
          }
        }}
      />

      {/* 교환 요청 목록이 있을 때만 MyExchangeList 표시 */}
      {myProposals.length > 0 && (
        <MyExchangeList
          cards={myProposals}
          onCancelExchange={handleCancelExchange}
        />
      )}
    </div>
  );
}
