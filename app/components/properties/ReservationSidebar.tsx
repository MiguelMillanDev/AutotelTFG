'use client';

import {useState, useEffect} from 'react';
import {Range} from 'react-date-range';
import { differenceInHours, eachHourOfInterval, format} from 'date-fns';
import DatePicker from '../forms/Calendar';
import apiService from '@/app/services/apiService';
import useLoginModal from '@/app/hooks/useLoginModal';

const initialDateRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
}

export type Parking = {
    id: string;
    spaces: number;
    price_per_hour: number;
}

interface ReservationSidebarProps {
    userId: string | null;
    parking: Parking;
}

const ReservationSidebar: React.FC<ReservationSidebarProps> = ({
    parking,
    userId
}) => {
    const loginModal = useLoginModal();

    const [fee, setFee] = useState<number>(0);
    const [hours, setHours] = useState<number>(1);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [dateRange, setDateRange] = useState<Range>(initialDateRange);
    const [minDate, setMinDate] = useState<Date>(new Date());
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [spaces, setSpaces] = useState<string>('1');
    const spacesRange = Array.from({ length: parking.spaces }, (_, index) => index + 1);

    const performBooking = async () => {
        if (userId) {
            if (dateRange.startDate && dateRange.endDate) {
                const formData = new FormData();
                formData.append('spaces', spaces);
                formData.append('start_date', format(dateRange.startDate, 'yyyy-MM-dd HH:mm'));
                formData.append('end_date', format(dateRange.endDate, 'yyyy-MM-dd HH:mm'));
                formData.append('number_of_hours', hours.toString());
                formData.append('total_price', totalPrice.toString());

                const response = await apiService.post(`/api/parkings/${parking.id}/book/`, formData);

                if (response.success) {
                    console.log('Booking successful');
                } else {
                    console.log('Something went wrong...');
                }
            }
        } else {
            loginModal.open();
        }
    }

    const _setDateRange = (selection: any) => {
        const newStartDate = new Date(selection.startDate);
        const newEndDate = new Date(selection.endDate);

        if (newEndDate <= newStartDate) {
            newEndDate.setHours(newStartDate.getHours() + 1);
        }

        setDateRange({
            ...dateRange,
            startDate: newStartDate,
            endDate: newEndDate
        });
    }

    const getReservations = async () => {
        const reservations = await apiService.get(`/api/parkings/${parking.id}/reservations/`);

        let dates: Date[] = [];

        reservations.forEach((reservation: any) => {
            const range = eachHourOfInterval({
                start: new Date(reservation.start_date),
                end: new Date(reservation.end_date)
            });

            dates = [...dates, ...range];
        });

        setBookedDates(dates);
    }

    useEffect(() => {
        getReservations();

        if (dateRange.startDate && dateRange.endDate) {
            const hourCount = differenceInHours(
                dateRange.endDate,
                dateRange.startDate
            );

            if (hourCount && parking.price_per_hour) {
                const _fee = ((hourCount * parking.price_per_hour) / 100) * 5;

                setFee(_fee);
                setTotalPrice((hourCount * parking.price_per_hour) + _fee);
                setHours(hourCount);
            } else {
                const _fee = (parking.price_per_hour / 100) * 5;

                setFee(_fee);
                setTotalPrice(parking.price_per_hour + _fee);
                setHours(1);
            }
        }
    }, [dateRange]);

    return (
        <aside className="mt-6 p-6 col-span-2 rounded-xl border border-gray-300 shadow-xl">
            <h2 className="mb-5 text-2xl">${parking.price_per_hour} per hour</h2>

            <DatePicker
                value={dateRange}
                bookedDates={bookedDates}
                onChange={(value) => _setDateRange(value.selection)}
            />

            <div className="mb-6 p-3 border border-gray-400 rounded-xl">
                <label className="mb-2 block font-bold text-xs">Spaces</label>

                <select 
                    value={spaces}
                    onChange={(e) => setSpaces(e.target.value)}
                    className="w-full -ml-1 text-xm"
                >
                    {spacesRange.map(number => (
                        <option key={number} value={number}>{number}</option>
                    ))}
                </select>
            </div>

            <div 
                onClick={performBooking}
                className="w-full mb-6 py-6 text-center text-white bg-airbnb hover:bg-airbnb-dark rounded-xl"
            >
                Book
            </div>

            <div className="mb-4 flex justify-between align-center">
                <p>${parking.price_per_hour} * {hours} hours</p>

                <p>${parking.price_per_hour * hours}</p>
            </div>

            <div className="mb-4 flex justify-between align-center">
                <p>Djangobnb fee</p>

                <p>${fee}</p>
            </div>

            <hr />

            <div className="mt-4 flex justify-between align-center font-bold">
                <p>Total</p>

                <p>${totalPrice}</p>
            </div>
        </aside>
    )
}

export default ReservationSidebar;
