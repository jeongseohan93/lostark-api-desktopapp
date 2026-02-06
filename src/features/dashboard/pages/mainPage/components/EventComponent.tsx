import { useState } from 'react';
import { useEvent } from '../hooks/useLostArkEvent';
import { openExternal } from '../../../../../shared/api/IpcWindow';
import { SlArrowLeft,  SlArrowRight } from 'react-icons/sl'
import style from '../style/EventComponent.module.css';

const EventComponent = () => {

    const { event , loading, error } = useEvent();

    const [ startIndex , setStartIndex ] = useState<number>(0);

    const [ emphasizeIndex, setEmphasizeIndex ] = useState<number>(0);

    const EVENT_VIEW_COUNT = 4;

    const eventPrevBefore = () => {
       
    }

    const eventPrevNext = () => {

    setEmphasizeIndex(prevEmphasize => {
        if (prevEmphasize >= event.length - 1) {
            setStartIndex(0); 
            return 0; 
        }

        const newEmphasizeIndex = prevEmphasize + 1;

        setStartIndex(prevStart => {
            const lastPossibleStart = event.length - EVENT_VIEW_COUNT;
            
            if (prevStart >= lastPossibleStart) {
                return prevStart;
            }

            const SLIDING_TRIGGER_OFFSET = 2; 
            if ((newEmphasizeIndex - prevStart) > SLIDING_TRIGGER_OFFSET) {
                return prevStart + 1; 
            }
            
            return prevStart;
        });

        return newEmphasizeIndex;
    });
};

    const indicatorSelect = (e: React.MouseEvent<HTMLButtonElement> ,index : number) => {

        e.preventDefault();

        const lastPossibleStartIndex = event.length - EVENT_VIEW_COUNT;

        setEmphasizeIndex(index);

        if ( index > 2 ) {
            const calculatedStartIndex = index - 2;
            const newStartIndex = Math.min(calculatedStartIndex, lastPossibleStartIndex);
            setStartIndex(newStartIndex);
        } else {
            setStartIndex(0);
        }
        
    }

    const openExternalWindow = ( e:React.MouseEvent<HTMLAnchorElement> ,url: string) => {
        
        e.preventDefault();

        openExternal(url);

    }

    if(loading) {
        return(
            <div>
                <p>로딩중...</p>
            </div>
        )
    }

    if(error) {
        return (
            <div>
                <p>에러 발생 : {error}</p>
            </div>
        )
    }

    if(!event) {
        return (
            <div>
                <p>진행 중인 이벤트가 없습니다.</p>
            </div>
        )
    }

    const Title_Slice = event.slice(startIndex, startIndex + EVENT_VIEW_COUNT);

    return (
        <div>
            <div>
                <h2>이벤트</h2>
                <a
                    onClick={(e)=>openExternalWindow(e, event[emphasizeIndex].Link)}
                >
                    <img src = {event[emphasizeIndex].Thumbnail}/>
                </a>
            </div>

            <div>
                <button
                    onClick={eventPrevBefore}
                >
                    <SlArrowLeft />
                </button>

                {Title_Slice.map((event, index)=> {
                    const actualTitle = startIndex + index;
                    return(
                        <button
                            key={event.Link}
                            className={`${emphasizeIndex === actualTitle ? style.active : ''}`}
                            onClick={(e)=>indicatorSelect(e,actualTitle)}

                        >
                            {event.Title}
                        </button>
                    )
                })}

                <button
                    onClick={eventPrevNext}
                >
                    <SlArrowRight />
                </button>
            </div>

        </div>
    )
}

export default EventComponent;