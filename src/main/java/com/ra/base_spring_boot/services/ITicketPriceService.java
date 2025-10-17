package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.resp.FestivalResponse;
import com.ra.base_spring_boot.dto.resp.TicketPriceResponse;
import com.ra.base_spring_boot.model.Showtime;
import com.ra.base_spring_boot.model.TicketPrice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ITicketPriceService {
    Page<TicketPrice> getAllTicketPrices(String typeSeat, String typeMovie, String sortBy, Pageable pageable);
    List<TicketPriceResponse> getAllTicketPricesForHomePage();
    TicketPrice getTicketPriceById(Long id);
    TicketPrice addTicketPrice(TicketPrice ticketPrice);
    TicketPrice updateTicketPrice(Long id, TicketPrice ticketPrice);
    void deleteTicketPrice(Long id);
    TicketPriceResponse getPriceBySeatAndMovieType(String typeSeat, String typeMovie);
    Page<TicketPriceResponse> getApplicableTicketPrices(Showtime showtime, Pageable pageable);
}