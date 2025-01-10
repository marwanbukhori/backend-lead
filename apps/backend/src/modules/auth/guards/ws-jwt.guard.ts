import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken = client.handshake.auth.token ||
                       client.handshake.headers.authorization?.split(' ')[1];

      if (!authToken) {
        throw new WsException('Unauthorized');
      }

      const payload = this.jwtService.verify(authToken);
      const user = await this.authService.validateUser(payload.sub);

      if (!user) {
        throw new WsException('Unauthorized');
      }

      // Attach user to socket data
      client.data.user = user;
      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }
}
