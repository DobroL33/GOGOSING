package com.ssafy.gogosing.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.gogosing.dto.genre.request.GenreRequestDto;
import com.ssafy.gogosing.service.GenreService;

import io.swagger.annotations.ApiOperation;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/genre")
public class GenreController {
	private final GenreService genreService;

	@PostMapping
	@ApiOperation(value = "좋아하는 장르 선택")
	public ResponseEntity<?> registGenre(@Valid @RequestBody GenreRequestDto genreRequestDto) throws Exception{
		genreService.registGenre(genreRequestDto);
		return ResponseEntity.ok().body("");
	}

	@GetMapping("/{userId}")
	@ApiOperation(value = "사용자 장르 조회")
	public List<Long> findGenres(@PathVariable Long userId) {
		return genreService.findGenres(userId);
	}

	@PostMapping("/update")
	@ApiOperation(value = "장르 수정")
	public ResponseEntity<?> updateGenre(@Valid @RequestBody GenreRequestDto genreRequestDto) throws Exception{
		genreService.updateGenre(genreRequestDto);
		return ResponseEntity.ok().body("");
	}
}