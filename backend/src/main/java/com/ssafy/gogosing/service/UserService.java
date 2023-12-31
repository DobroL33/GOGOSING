package com.ssafy.gogosing.service;

import com.ssafy.gogosing.domain.user.User;
import com.ssafy.gogosing.dto.user.request.UserPasswordUpdateRequestDto;
import com.ssafy.gogosing.dto.user.request.UserQuitRequestDto;
import com.ssafy.gogosing.dto.user.request.UserSignUpRequestDto;
import com.ssafy.gogosing.dto.user.request.UserSingUpPlusRequestDto;
import com.ssafy.gogosing.dto.user.response.UserMypageResponseDto;
import com.ssafy.gogosing.dto.user.response.UserMypageVoiceFileResponseDto;
import com.ssafy.gogosing.dto.user.response.UserMypageVoiceRangeResponseDto;
import com.ssafy.gogosing.global.redis.repository.CertificationNumberDao;
import com.ssafy.gogosing.global.redis.service.RedisAccessTokenService;
import com.ssafy.gogosing.global.redis.service.RedisRefreshTokenService;
import com.ssafy.gogosing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final RedisRefreshTokenService redisRefreshTokenService;

    private final RedisAccessTokenService redisAccessTokenService;

    private final EmailService emailCertificationService;

    private final CertificationNumberDao certificationNumberDao;

    public static final Logger logger = LoggerFactory.getLogger(UserService.class);

    /**
     * 일반 회원 가입
     */
    @Transactional
    public Long signUp(UserSignUpRequestDto userSignUpRequestDto) throws Exception {

        if(userRepository.findByEmail(userSignUpRequestDto.getEmail()).isPresent())
            throw new Exception("이미 존재하는 이메일입니다.");

        if(userRepository.findByNickname(userSignUpRequestDto.getNickname()).isPresent())
            throw new Exception("이미 존재하는 닉네임입니다.");

        // 이메일 유효성 검사
        if (!Pattern.matches("[0-9a-zA-Z]+(.[_a-z0-9-]+)*@(?:\\w+\\.)+\\w+$", userSignUpRequestDto.getEmail())) {
            throw new IllegalStateException("이메일 형식을 다시 맞춰주세요.");
        }

        emailCertificationService.verifyEmail(userSignUpRequestDto.getEmailCertificationNumber(), userSignUpRequestDto.getEmail());

        // 인증된 이메일로 가입을 시도하면 redis에 저장한 인증번호 삭제
        certificationNumberDao.removeCertificationNumber(userSignUpRequestDto.getEmail());

        // 비밀번호 유효성 검사
        if (!Pattern.matches("^.*(?=^.{9,15}$)(?=.*\\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$", userSignUpRequestDto.getPassword())) {
            throw new IllegalStateException("비밀번호 형식이 맞지않습니다.");
        }

        User user = userSignUpRequestDto.toEntity();

        user.passwordEncode(passwordEncoder);

        user.updateProfileImage("https://gogosing.s3.ap-northeast-2.amazonaws.com/DefaultProfile.png");

        System.out.println(user.getEmail());
        User saveUser = userRepository.save(user);

        return saveUser.getId();
    }

    /**
     * 소셜 회원가입 시 따로 추가 정보 받기
     */
    @Transactional
    public Long singUpPlus(UserSingUpPlusRequestDto userSingUpPlusRequestDto, UserDetails userDetails) throws Exception {

        if(userRepository.findByNickname(userSingUpPlusRequestDto.getNickname()).isPresent())
            throw new Exception("이미 존재하는 닉네임입니다.");

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new EmptyResultDataAccessException("해당 유저는 존재하지 않습니다.", 1));

        if(user.getProfileImg() == null) {
            user.updateProfileImage("https://gogosing.s3.ap-northeast-2.amazonaws.com/DefaultProfile.png");
        }

        user.updateSignupPlus(userSingUpPlusRequestDto);

        User saveUser = userRepository.save(user);

        return saveUser.getId();
    }

    /**
     * 로그아웃
     * 성공 시 accessToken blacklist 추가 및 refreshToken 삭제
     */
    public Long logout(String accessToken, UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new EmptyResultDataAccessException("해당 유저는 존재하지 않습니다.", 1));

        redisRefreshTokenService.deleteRefreshToken(user.getEmail());
        redisAccessTokenService.setRedisAccessToken(accessToken.replace("Bearer ", ""), "LOGOUT");

        return user.getId();
    }

    /**
     * 회원 탈퇴
     * 성공 시 accessToken blacklist 추가 및 refreshToken 삭제
     */
    @Transactional
    public Long quit(String accessToken, UserQuitRequestDto userQuitRequestDto, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new EmptyResultDataAccessException("해당 유저는 존재하지 않습니다.", 1));

        if(userQuitRequestDto.isSocialType()) { // 소셜 탈퇴 시
            if(!userQuitRequestDto.getCheckPassword().equals("회원탈퇴")){
                throw new RuntimeException("회원 탈퇴 문구를 다시 입력하여 주세요.");
            }

            user.updateSocialDelete();
        } else {    // 자체 탈퇴 시
            user.updateDeletedDate();
            user.checkPassword(userQuitRequestDto.getCheckPassword(), passwordEncoder);
        }

        userRepository.save(user);

        redisRefreshTokenService.deleteRefreshToken(user.getEmail());
        redisAccessTokenService.setRedisAccessToken(accessToken.replace("Bearer ", ""), "QUIT");

        return user.getId();
    }

    /**
     * 마이페이지에 제공할 회원 상세정보 가져오기
     */
    public UserMypageResponseDto getUserDetail(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        return new UserMypageResponseDto(user);
    }

    /**
     * 마이페이지에 제공할 회원 음역대정보 가져오기
     */
    public UserMypageVoiceRangeResponseDto getUserVocieRange(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        if(user.getVoiceRangeHighest() == null) {
            throw new EmptyResultDataAccessException("음역대 분석 데이터가 존재하지 않습니다.", 1);
        }

        return new UserMypageVoiceRangeResponseDto(user);
    }

    /**
     * 마이페이지에 제공할 회원 목소리 파일 가져오기
     */
    public UserMypageVoiceFileResponseDto getUserVocieFile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        if(user.getVoiceRangeHighest() == null) {
            throw new EmptyResultDataAccessException("파형 분석 데이터가 존재하지 않습니다.", 1);
        }

        return new UserMypageVoiceFileResponseDto(user);
    }

    public void nicknameUsefulCheck(String nickname) throws Exception {

        if(userRepository.findByNickname(nickname).isPresent())
            throw new Exception("이미 존재하는 닉네임입니다.");
    }

    @Transactional
    public void updateNickname(String nickname, UserDetails userDetails) throws Exception {
        logger.info("*** updateNickname 메소드 호출");

        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow(() ->
        {
            logger.info("*** 존재하지 않는 유저");
            return new EmptyResultDataAccessException("해당 유저는 존재하지 않습니다.", 1);
        });
        nicknameUsefulCheck(nickname);
        user.updateNickname(nickname);
        userRepository.save(user);
        logger.info("*** updateNickname 메소드 종료");
    }

    @Transactional
    public Long updatePassword(UserPasswordUpdateRequestDto userPasswordUpdateRequestDto, UserDetails userDetails) throws Exception {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        user.checkPassword(userPasswordUpdateRequestDto.getCheckPassword(), passwordEncoder);

        // 비밀번호 유효성 검사
        if (!Pattern.matches("^.*(?=^.{9,15}$)(?=.*\\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$", userPasswordUpdateRequestDto.getNewPassword())) {
            throw new IllegalStateException("비밀번호 형식이 맞지않습니다.");
        }

        user.updatePassword(userPasswordUpdateRequestDto.getNewPassword(), passwordEncoder);
        userRepository.save(user);

        return user.getId();
    }
}
