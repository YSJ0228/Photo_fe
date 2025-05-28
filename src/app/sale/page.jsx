'use client';

import {useEffect, useState, useCallback} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import SearchInput from '@/components/ui/input/SearchInput';
import DropdownInput from '@/components/ui/input/DropdownInput';
import FilterBottomSheet from '@/components/market/FilterBottomSheet';
import CardList from '@/components/ui/card/cardOverview/CardList';
import Pagination from '@/components/market/Pagination';
import {fetchMySalesCards} from '@/lib/api/shop';
import {countFilterValues} from '@/utils/countFilterValues';
import {formatCardGrade} from '@/utils/formatCardGrade';
import gradeStyles from '@/utils/gradeStyles';
import NoHeader from '@/components/layout/NoHeader';

export default function MySalesPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('latest');
  const [filter, setFilter] = useState({type: '', value: ''});
  const [filterCounts, setFilterCounts] = useState({grade: {}, genre: {}});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);

  const checkDeviceType = useCallback(() => {
    const pcMinWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--breakpoint-pc',
      ),
    );
    return window.innerWidth < pcMinWidth;
  }, []);

  useEffect(() => {
    const handleResize = () => setIsTabletOrMobile(checkDeviceType());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkDeviceType]);

  useEffect(() => {
    fetchMySalesCards({pageParam: 1, take: 1000}).then(res => {
      const counts = countFilterValues(res.result);
      setFilterCounts(counts);
    });
  }, []);

  const {data} = useQuery({
    queryKey: ['mySalesPage', keyword, sort, filter, currentPage],
    queryFn: () =>
      fetchMySalesCards({
        pageParam: currentPage,
        take: 4,
        keyword,
        sort,
        filterType: filter.type,
        filterValue: filter.value,
      }),
  });

  const displayCards = data?.result ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const nickname = data?.nickname;

  const handleSearch = value => setKeyword(value);

  return (
    <div className="max-w-[1480px] mx-auto">
      <div className="block tablet:hidden">
        <NoHeader title="마이갤러리" />
      </div>
      {/* 데스크탑/태블릿 헤더 */}
      <div className="hidden tablet:flex justify-between items-center">
        <h1 className="font-baskin text-[48px] pc:text-[62px] text-white">
          나의 판매 포토카드
        </h1>
      </div>

      <hr className="hidden tablet:block border-2 border-gray200 mt-5 mb-10" />
      {/* 유저 정보, 수량 */}
      <p className="text-white text-sm mb-[15px] tablet:text-xl pc:text-2xl tablet:mb-5">
        {nickname}님이 보유한 포토카드{' '}
        <span className="text-gray300 text-xs tablet:text-lg pc:text-xl">
          ({totalCount}장)
        </span>
      </p>

      {/* 카드장르별 수량 */}
      <div className="flex gap-[10px] mb-[15px] text-xs font-light overflow-x-auto whitespace-nowrap tablet:text-sm tablet:mb-10 pc:text-base pc:gap-5">
        {['COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY'].map(grade => (
          <span
            key={grade}
            className={`px-3 py-1 border ${gradeStyles[grade]} pc:px-5 pc:py-[10px]`}
          >
            {formatCardGrade(grade)} {filterCounts.grade[grade] ?? 0}장
          </span>
        ))}
      </div>

      <div className="space-y-[15px] pb-[80px]">
        <hr className="border-gray400 mt-[15px]" />
        {/* 모바일 필터 + 검색 */}
        <div className="flex tablet:hidden items-center gap-[10px] mb-5">
          {/* 필터 버튼 */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="w-[45px] h-[45px] border border-white rounded-xs flex items-center justify-center shrink-0"
          >
            <Image
              src="/icons/ic_filter.svg"
              alt="필터"
              width={20}
              height={20}
            />
          </button>

          {/* 검색창 */}
          <SearchInput
            name="query"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onSearch={handleSearch}
            placeholder="검색"
            className="flex-grow h-[35px]"
          />
        </div>

        {/* 데스크탑/태블릿: 검색 + 필터 + 정렬 */}
        <div className="hidden tablet:flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center max-w-full mb-10 tablet:max-w-[calc(100%-180px)]">
            {/* 검색창 */}
            <div>
              <SearchInput
                name="query"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onSearch={handleSearch}
                placeholder="검색"
                className="!w-[200px] !h-[45px] pc:!w-[320px]"
              />
            </div>

            <div className="tablet:ml-[30px] pc:ml-[60px]">
              <DropdownInput
                className="border-none !px-0 !gap-[10px]"
                name="grade"
                value={filter.type === 'grade' ? filter.value : ''}
                // 드롭다운 토글
                onChange={({target}) => {
                  const isSameValue =
                    filter.type === 'grade' && filter.value === target.value;
                  setFilter(
                    isSameValue
                      ? {type: '', value: ''}
                      : {type: 'grade', value: target.value},
                  );
                }}
                placeholder="등급"
                options={[
                  {label: 'COMMON', value: 'COMMON'},
                  {label: 'RARE', value: 'RARE'},
                  {label: 'SUPER RARE', value: 'SUPER_RARE'},
                  {label: 'LEGENDARY', value: 'LEGENDARY'},
                ]}
              />
            </div>

            <div className="tablet:ml-[25px] pc:ml-[45px]">
              <DropdownInput
                className="border-none !px-0 !gap-[10px]"
                name="genre"
                value={filter.type === 'genre' ? filter.value : ''}
                // 드롭다운 토글
                onChange={({target}) => {
                  const isSameValue =
                    filter.type === 'genre' && filter.value === target.value;
                  setFilter(
                    isSameValue
                      ? {type: '', value: ''}
                      : {type: 'genre', value: target.value},
                  );
                }}
                placeholder="장르"
                options={[
                  {label: '여행', value: 'TRAVEL'},
                  {label: '풍경', value: 'LANDSCAPE'},
                  {label: '인물', value: 'PORTRAIT'},
                  {label: '사물', value: 'OBJECT'},
                ]}
              />
            </div>
            <div className="tablet:ml-[25px] pc:ml-[45px]">
              <DropdownInput
                className="border-none !px-0 !gap-[10px]"
                name="method"
                value={filter.type === 'method' ? filter.value : ''}
                onChange={({target}) => {
                  const isSame =
                    filter.type === 'method' && filter.value === target.value;
                  setFilter(
                    isSame
                      ? {type: '', value: ''}
                      : {type: 'method', value: target.value},
                  );
                }}
                placeholder="판매방법"
                options={[
                  {label: '판매', value: 'for_sale'},
                  {label: '교환', value: 'exchange_only'},
                ]}
              />
            </div>

            <div className="tablet:ml-[25px] pc:ml-[45px]">
              <DropdownInput
                className="border-none !px-0 !gap-[10px]"
                name="soldOut"
                value={filter.type === 'soldOut' ? filter.value : ''}
                onChange={({target}) => {
                  const isSame =
                    filter.type === 'soldOut' && filter.value === target.value;
                  setFilter(
                    isSame
                      ? {type: '', value: ''}
                      : {type: 'soldOut', value: target.value},
                  );
                }}
                placeholder="매진 여부"
                options={[
                  {label: '판매중', value: 'false'},
                  {label: '매진', value: 'true'},
                ]}
              />
            </div>
          </div>
        </div>

        <div>
          <CardList
            cards={displayCards}
            className={`grid ${
              isTabletOrMobile ? 'grid-cols-2' : 'grid-cols-3'
            } gap-4`}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={data?.totalPages ?? 1}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* 모바일 하단 고정 바 + 필터 바텀시트 */}
        <div className="tablet:hidden">
          <FilterBottomSheet
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            onApply={filter => setFilter(filter)}
            filterCounts={filterCounts}
            tabs={['grade', 'genre']}
            selectedFilter={filter}
          />
        </div>
      </div>
    </div>
  );
}
