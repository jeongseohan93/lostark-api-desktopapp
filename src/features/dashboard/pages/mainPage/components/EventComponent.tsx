import { useState } from 'react';
import { useEvent } from '../hooks/useLostArkEvent';
import { openExternal } from '../../../../../shared/api/IpcWindow';
import { SlArrowLeft,  SlArrowRight } from 'react-icons/sl'

const EventComponent = () => {

    const { event , loading, error } = useEvent();

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

    return (
        <div>
            
        </div>
    )
}

export default EventComponent;