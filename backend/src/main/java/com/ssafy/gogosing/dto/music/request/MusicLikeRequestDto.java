package com.ssafy.gogosing.dto.music.request;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MusicLikeRequestDto {
    private Long musicId;
}
